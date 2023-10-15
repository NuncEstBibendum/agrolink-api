import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/core/decorators/user.decorator';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserConversations(user: UserEntity) {
    return this.prismaService.conversation.findMany({
      where: {
        users: {
          some: {
            id: user.userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
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
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getAllUnansweredConversations(user: UserEntity) {
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
    if (foundUser.profession !== 'agronomist')
      throw new UnauthorizedException('User is not an agronomist');

    return this.prismaService.conversation.findMany({
      where: {
        users: {
          some: {
            id: user.userId,
          },
        },
        messages: {
          some: {
            hasAnswer: false,
          },
        },
      },
      select: {
        id: true,
        title: true,
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
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
