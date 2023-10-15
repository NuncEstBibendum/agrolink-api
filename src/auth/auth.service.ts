import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../shared/contact/email.service';
import { CreateUserDto } from '../users/dto/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signin({ email, password }: { email: string; password: string }) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return this.login(user.id, user.email, user.profession);
    }
    throw new UnauthorizedException('Wrong credentials');
  }

  async login(userID: string, email: string, profession: string) {
    const payload = { sub: userID };
    return {
      accessToken: this.jwtService.sign(payload),
      email,
      profession,
    };
  }

  async isEmailFree(email: string, currentUserID?: string) {
    const existingUser = await this.prismaService.user.findFirst({
      where: { email, id: { not: currentUserID } },
    });
    return {
      emailFree: Boolean(!existingUser),
    };
  }

  async updatePassword(
    userID: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id: userID },
      select: { password: true },
    });

    if (await bcrypt.compare(oldPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      return this.prismaService.user.update({
        where: { id: userID },
        data: { password: hashedPassword },
      });
    } else {
      throw new UnauthorizedException('Wrong password');
    }
  }

  async createUser({ email, name, password, profession }: CreateUserDto) {
    //Check email availability
    const emailFree = await this.isEmailFree(email);
    if (!emailFree) {
      throw new ConflictException(`An user already exists with email ${email}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prismaService.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        profession,
      },
    });
  }

  async updateUser(
    id: string,
    { email, name, password, profession }: CreateUserDto,
  ) {
    //Check email availability
    const emailFree = await this.isEmailFree(email, id);
    if (!emailFree) {
      throw new ConflictException(`An user already exists with email ${email}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        email,
        name,
        password: hashedPassword,
        profession,
      },
    });
  }

  async sendPasswordRecovery({
    redirectURL,
    userEmail,
  }: {
    userEmail: string;
    redirectURL: string;
  }) {
    const token = uuidv4();

    try {
      const { id } = await this.prismaService.user.update({
        where: { email: userEmail },
        data: { passwordRecoveryToken: token },
        select: { id: true },
      });

      await this.emailService.sendMail(
        'Send password recovery link',
        userEmail,
        {
          url: redirectURL + `?id=${id}&token=${token}`,
        },
      );
    } catch (e) {
      // The account does not exist.
      // Do not say anything to the user.
    }
  }

  async updateMyPasswordByLink({
    newPassword,
    token,
    userID,
  }: {
    userID: string;
    token: string;
    newPassword: string;
  }) {
    const { passwordRecoveryToken } =
      await this.prismaService.user.findUniqueOrThrow({
        where: { id: userID },
        select: { passwordRecoveryToken: true },
      });

    if (passwordRecoveryToken !== token) {
      throw new UnauthorizedException(`Invalid token`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prismaService.user.update({
      where: { id: userID },
      data: {
        passwordRecoveryToken: null,
        password: hashedPassword,
      },
    });
  }
}
