import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  IsUUID,
} from 'class-validator';
import { PASSWORD_REGEX } from '../../shared/constants';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  profession: string;
}

export class UserDto extends OmitType(CreateUserDto, ['password'] as const) {
  @IsUUID('4')
  id: string;
}

export class UpdateUserDto extends PartialType(
  PickType(UserDto, ['name'] as const),
) {}

export class UserIDQueryDto extends PickType(UserDto, ['id'] as const) {}
