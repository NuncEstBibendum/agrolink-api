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
        tags: true,
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

    const conversationsWithoutAuthors =
      await this.prismaService.conversation.findMany({
        where: {
          messages: {
            some: {
              hasAnswer: false,
            },
          },
        },
        select: {
          id: true,
          title: true,
          authorId: true,
          tags: true,
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

    const conversationsWithAuthor = await Promise.all(
      conversationsWithoutAuthors.map(async (conversation) => {
        const author = await this.prismaService.user.findUnique({
          where: {
            id: conversation.authorId,
          },
          select: {
            name: true,
          },
        });
        return {
          ...conversation,
          author,
        };
      }),
    );

    return conversationsWithAuthor;
  }

  async getAllAnsweredConversations(user: UserEntity) {
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

    const conversationsWithoutAuthors =
      await this.prismaService.conversation.findMany({
        where: {
          messages: {
            every: {
              hasAnswer: true,
            },
          },
        },
        select: {
          id: true,
          title: true,
          authorId: true,
          tags: true,
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

    const conversationsWithAuthor = await Promise.all(
      conversationsWithoutAuthors.map(async (conversation) => {
        const author = await this.prismaService.user.findUnique({
          where: {
            id: conversation.authorId,
          },
          select: {
            name: true,
          },
        });
        return {
          ...conversation,
          author,
        };
      }),
    );

    return conversationsWithAuthor;
  }

  async getConversationById(user: UserEntity, id: string) {
    const foundConversation = await this.prismaService.conversation.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        tags: true,
        messages: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            hasAnswer: true,
            isLiked: true,
            user: {
              select: {
                id: true,
                name: true,
                profession: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            profession: true,
          },
        },
      },
    });

    if (!foundConversation)
      throw new NotFoundException('Conversation not found');

    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        profession: true,
      },
    });

    if (foundUser.profession === 'farmer') {
      const isUserInConversation = foundConversation.users.some(
        (userInConversation) => userInConversation.id === user.userId,
      );

      if (!isUserInConversation)
        throw new UnauthorizedException('User is not in conversation');
    }

    return foundConversation;
  }
}
