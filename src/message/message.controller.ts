import { Controller, UseGuards, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';
import { SendFirstMessageDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendFirstMessage(
    @UserDecorator() user: UserEntity,
    payload: SendFirstMessageDto,
  ) {
    return this.messageService.sendFirstMessage(
      user,
      payload.title,
      payload.message,
      payload.tags,
    );
  }
}
