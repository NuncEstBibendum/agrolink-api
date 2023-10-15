import { Controller } from '@nestjs/common';
import {
  Body,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common/decorators';
import { Public } from '../core/decorators/public.decorator';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';
import { AuthService } from './auth.service';
import {
  ForgottenPasswordDto,
  LoginDto,
  UpdatePasswordByLinkDto,
  UpdatePasswordDto,
  UserEmailFreeQueryDto,
  UserIDQueryDto,
} from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/users.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() payload: CreateUserDto) {
    const user = await this.authService.createUser(payload);
    return this.authService.login(user.id, user.email, user.profession);
  }

  @Post('signin')
  @Public()
  async signin(@Body() payload: LoginDto) {
    return this.authService.signin(payload);
  }

  @Put('update/password')
  async updateUserPassword(
    @UserDecorator() user: UserEntity,
    @Body() payload: UpdatePasswordDto,
  ) {
    const res = await this.authService.updatePassword(
      user.userId,
      payload.oldPassword,
      payload.newPassword,
    );
    return this.authService.login(user.userId, res.email, res.profession);
  }

  @Put('register/update')
  @Public()
  @UseGuards(JwtAuthGuard)
  async updateUnverifiedAccount(
    @Query() query: UserIDQueryDto,
    @Body() payload: CreateUserDto,
  ) {
    const user = await this.authService.updateUser(query.id, payload);
    return this.authService.login(user.id, user.email, user.profession);
  }

  @Public()
  @Get('email-free')
  async isEmailFree(@Query() query: UserEmailFreeQueryDto) {
    return this.authService.isEmailFree(query.email, query.id);
  }

  @Public()
  @Post('forgotten-password')
  async promptPasswordRecovery(@Body() payload: ForgottenPasswordDto) {
    await this.authService.sendPasswordRecovery({
      userEmail: payload.email,
      redirectURL: payload.redirectURL,
    });
  }

  @Public()
  @Put('forgotten-password/update')
  async updatePasswordByLink(@Body() payload: UpdatePasswordByLinkDto) {
    await this.authService.updateMyPasswordByLink({
      userID: payload.id,
      newPassword: payload.password,
      token: payload.token,
    });
  }
}
