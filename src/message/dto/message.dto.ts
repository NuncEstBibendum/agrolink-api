import { TagEnum } from '@prisma/client';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SendFirstMessageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsNotEmpty()
  tags: TagEnum[];
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  conversationId: string;
}
