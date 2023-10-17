import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../shared/constants';
import { UserDto, CreateUserDto } from '../../users/dto/users.dto';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX)
  confirmNewPassword: string;
}

export class EmailRedirectDto {
  @IsString()
  @IsNotEmpty()
  redirectURL: string;
}

export class ForgottenPasswordDto extends IntersectionType(
  PickType(UserDto, ['email'] as const),
  PickType(EmailRedirectDto, ['redirectURL'] as const),
) {}

export class UpdatePasswordByLinkDto extends IntersectionType(
  PickType(UserDto, ['id'] as const),
  PickType(CreateUserDto, ['password'] as const),
) {
  @IsUUID('4')
  @IsNotEmpty()
  token: string;
}

export class UserEmailQueryDto extends PickType(UserDto, ['email'] as const) {}
export class UserIDQueryDto extends PickType(UserDto, ['id'] as const) {}
export class UserEmailFreeQueryDto extends IntersectionType(
  PartialType(UserIDQueryDto),
  UserEmailQueryDto,
) {}
