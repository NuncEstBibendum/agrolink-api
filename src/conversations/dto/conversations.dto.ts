import { IsNotEmpty, IsString } from 'class-validator';

export class GetConversationByIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
