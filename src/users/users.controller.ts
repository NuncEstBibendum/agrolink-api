import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';
import { UpdateUserDto, UserDto, UserIDQueryDto } from './dto/users.dto';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@UserDecorator() user): Promise<UserDto> {
    if (!user) {
      return null;
    }
    return this.userService.retrieveOneUser(user.userId);
  }

  @Get()
  async getUser(@Query() query: UserIDQueryDto): Promise<UserDto> {
    return this.userService.retrieveOneUser(query.id);
  }

  @Put('update')
  async updateUser(
    @UserDecorator() user: UserEntity,
    @Body() payload: UpdateUserDto,
  ) {
    await this.userService.updateUser(user.userId, payload);
  }
}
