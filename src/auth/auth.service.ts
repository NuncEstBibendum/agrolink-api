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
import { CreateUserDto, UpdateUserEmailDto } from '../users/dto/users.dto';

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
    } else if (
      user &&
      (await bcrypt.compare(password, user.temporaryPassword)) &&
      user.temporaryPasswordExpiry > new Date(Date.now())
    ) {
      const res = await this.login(user.id, user.email, user.profession);
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password: await bcrypt.hash(password, 10),
          temporaryPassword: null,
          temporaryPasswordExpiry: null,
        },
      });
      return {
        ...res,
        temporaryPassword: true,
      };
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
    confirmNewPassword: string,
  ) {
    if (newPassword !== confirmNewPassword) {
      throw new ConflictException(`Passwords don't match`);
    }

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

  async updateUserEmail(
    id: string,
    { email, confirmEmail, oldEmail, password }: UpdateUserEmailDto,
  ) {
    //Check email availability
    const emailFree = await this.isEmailFree(email, id);
    if (!emailFree) {
      throw new ConflictException(`An user already exists with email ${email}`);
    }

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { password: true, email: true },
    });

    // check if password is correct
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Wrong password');
    }

    // check if old email is correct
    if (oldEmail !== user.email) {
      throw new UnauthorizedException('Wrong email');
    }

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        email: confirmEmail,
      },
    });
  }

  async sendPasswordRecovery({ userEmail }: { userEmail: string }) {
    // generate a 8 character long temporary password
    const tempPassword = await uuidv4().slice(0, 8);

    try {
      await this.prismaService.user.update({
        where: { email: userEmail },
        data: {
          temporaryPassword: await bcrypt.hash(tempPassword, 10),
          temporaryPasswordExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
        select: { id: true },
      });

      await this.emailService.sendMail('Send temporary password', userEmail, {
        temporaryPassword: tempPassword,
      });
    } catch (e) {
      // The account does not exist.
      // Do not say anything to the user.
    }
  }
}
