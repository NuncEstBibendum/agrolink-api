import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TagEnum } from '@prisma/client';
import { UserEntity } from 'src/core/decorators/user.decorator';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendFirstMessage(
    user: UserEntity,
    title: string,
    message: string,
    tags: string[],
  ) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        profession: true,
      },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    const foundTags = await this.prismaService.tag.findMany({
      where: {
        name: {
          in: tags as TagEnum[],
        },
      },
    });

    if (!foundTags)
      throw new InternalServerErrorException(
        'Conversation could not be created due to an internal server error',
      );

    try {
      const createdConversation = await this.prismaService.conversation.create({
        data: {
          title: title,
          authorId: user.userId,
          users: {
            connect: [
              {
                id: user.userId,
              },
            ],
          },
          tags: {
            connect: foundTags.map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });

      if (!createdConversation)
        throw new NotFoundException('Conversation could not be created');

      await this.prismaService.message.create({
        data: {
          text: message,
          user: {
            connect: {
              id: user.userId,
            },
          },
          conversation: {
            connect: {
              id: createdConversation.id,
            },
          },
        },
      });

      return this.prismaService.conversation.findUnique({
        where: {
          id: createdConversation.id,
        },
        select: {
          id: true,
          users: {
            select: {
              id: true,
            },
          },
          messages: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Conversation could not be created due to an internal server error',
      );
    }
  }

  async sendMessage(user: UserEntity, message: string, conversationId: string) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        profession: true,
      },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    const foundConversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!foundConversation)
      throw new NotFoundException('Conversation not found');

    if (foundUser.profession === 'farmer') {
      const isUserInConversation = foundConversation.users.some(
        (user) => user.id === foundUser.id,
      );

      if (!isUserInConversation)
        throw new NotFoundException('User not in conversation');
    }

    // Find all messages in conversation and set hasAnswer to true
    await this.prismaService.message.updateMany({
      where: {
        conversationId: conversationId,
      },
      data: {
        hasAnswer: true,
      },
    });

    const createdMessage = await this.prismaService.message.create({
      data: {
        text: message,
        hasAnswer: foundUser.profession === 'agronomist' ? true : false,
        user: {
          connect: {
            id: user.userId,
          },
        },
        conversation: {
          connect: {
            id: conversationId,
          },
        },
      },
    });

    return this.prismaService.message.findUnique({
      where: {
        id: createdMessage.id,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async sendReactionToMessage(
    userId: string,
    messageId: string,
    reaction: boolean | null,
  ) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        profession: true,
      },
    });

    if (!foundUser) throw new NotFoundException('User not found');
    if (foundUser.profession !== 'farmer')
      throw new UnauthorizedException('User is not a farmer');

    const foundMessage = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        id: true,
        isLiked: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!foundMessage) throw new NotFoundException('Message not found');

    if (foundMessage.isLiked === reaction)
      throw new NotFoundException('Reaction already set');

    return this.prismaService.message.update({
      where: {
        id: messageId,
      },
      data: {
        isLiked: reaction,
      },
    });
  }
}
