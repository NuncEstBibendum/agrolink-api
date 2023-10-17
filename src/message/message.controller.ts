import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';
import { SendFirstMessageDto, SendMessageDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('first')
  async sendFirstMessage(
    @UserDecorator() user: UserEntity,
    @Body() payload: SendFirstMessageDto,
  ) {
    return this.messageService.sendFirstMessage(
      user,
      payload.title,
      payload.message,
      payload.tags,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(
    @UserDecorator() user: UserEntity,
    @Body() payload: SendMessageDto,
  ) {
    return this.messageService.sendMessage(
      user,
      payload.message,
      payload.conversationId,
    );
  }
}
