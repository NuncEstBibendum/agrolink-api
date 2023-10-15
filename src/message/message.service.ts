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
}
