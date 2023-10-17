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
  UpdatePasswordDto,
  UserEmailFreeQueryDto,
} from './dto/auth.dto';
import { CreateUserDto, UpdateUserEmailDto } from '../users/dto/users.dto';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @UseGuards(JwtAuthGuard)
  async updateUserPassword(
    @UserDecorator() user: UserEntity,
    @Body() payload: UpdatePasswordDto,
  ) {
    const res = await this.authService.updatePassword(
      user.userId,
      payload.oldPassword,
      payload.newPassword,
      payload.confirmNewPassword,
    );
    return this.authService.login(user.userId, res.email, res.profession);
  }

  @Put('/update/email')
  @UseGuards(JwtAuthGuard)
  async updateUserEmail(
    @UserDecorator() user: UserEntity,
    @Body() payload: UpdateUserEmailDto,
  ) {
    const res = await this.authService.updateUserEmail(user.userId, payload);
    return this.authService.login(res.id, res.email, res.profession);
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
    });
  }
}
