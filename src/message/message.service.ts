import { Injectable, NotFoundException } from '@nestjs/common';
import { TagEnum } from '@prisma/client';
import { UserEntity } from 'src/core/decorators/user.decorator';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendFirstMessage(
    user: UserEntity,
    title: string,
    message: string,
    tags: TagEnum[],
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
          in: tags,
        },
      },
    });

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
}
