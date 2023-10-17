import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/core/guards/jwtAuth.guard';
import {
  User as UserDecorator,
  UserEntity,
} from '../core/decorators/user.decorator';
import { GetConversationByIdDto } from './dto/conversations.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get('id')
  async getConversationById(
    @UserDecorator() user: UserEntity,
    @Query() query: GetConversationByIdDto,
  ) {
    return this.conversationsService.getConversationById(user, query.id);
  }
}
