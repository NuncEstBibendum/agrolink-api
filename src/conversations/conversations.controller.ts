import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserConversations(@UserDecorator() user: UserEntity) {
    return this.conversationsService.getUserConversations(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unanswered')
  async getAllUnansweredConversations(@UserDecorator() user: UserEntity) {
    return this.conversationsService.getAllUnansweredConversations(user);
  }
}
