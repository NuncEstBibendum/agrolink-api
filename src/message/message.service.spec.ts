import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { MessageService } from './message.service';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/core/decorators/user.decorator'; // adjust the import based on your actual file structure
import { Message, User } from '@prisma/client';

const mockUserData1: UserEntity = {
  userId: 'user-id-1',
};
const mockUserData2: UserEntity = {
  userId: 'user-id-2',
};
const mockeFullUserAgronomist: User = {
  id: 'user-id-1',
  name: 'User 1',
  email: '',
  password: '',
  profession: 'agronomist',
  createdAt: new Date(),
  temporaryPassword: '',
  temporaryPasswordExpiry: new Date(),
  updatedAt: new Date(),
};

const mockMessageData: Message = {
  id: 'msg1',
  text: 'Hello, World!',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-id-1',
  conversationId: 'conv1',
  hasAnswer: false,
  isLiked: false,
};

const mockConversationsData = {
  id: 'conv1',
  title: 'Conversation 1',
  tags: ['tag1'],
  messages: [],
  users: [mockUserData1, mockUserData2],
  author: mockeFullUserAgronomist,
};

const user: UserEntity = { userId: '1' };
const title = 'Test title';
const message = 'Test message content';
const tags: string[] = ['ACS'];

describe('MessageService', () => {
  let service: MessageService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            tag: {
              findMany: jest.fn(),
            },
            conversation: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            message: {
              create: jest.fn(),
              findUnique: jest.fn(),
              updateMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('sendFirstMessage', () => {
    it('should successfully send the first message', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      prisma.tag.findMany = jest.fn().mockResolvedValue([
        { id: '1', name: 'ACS' },
        { id: '2', name: 'CROP_PROTECTION' },
      ]);
      prisma.conversation.create = jest
        .fn()
        .mockResolvedValue(mockConversationsData);
      prisma.message.create = jest.fn().mockResolvedValue(mockMessageData);
      prisma.conversation.findUnique = jest
        .fn()
        .mockResolvedValue(mockConversationsData);

      const result = await service.sendFirstMessage(user, title, message, tags);

      expect(result).toBeDefined();
      expect(result.id).toEqual('conv1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.userId },
        select: { id: true, profession: true },
      });
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: tags } },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.sendFirstMessage(user, 'title', 'message', ['ACS']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('should throw InternalServerErrorException when tags are not found', async () => {
    const user: UserEntity = { userId: '1' };
    prisma.user.findUnique = jest.fn().mockResolvedValue(user);
    prisma.tag.findMany = jest.fn().mockResolvedValue([]);

    await expect(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.sendFirstMessage(user, 'title', 'message', ['UNKNOWN_TAG']), // ignore ts error to test unknown tag
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should create a conversation and send a message', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue(user);
    prisma.tag.findMany = jest.fn().mockResolvedValue([
      { id: '1', name: 'ACS' },
      { id: '2', name: 'CROP_PROTECTION' },
    ]);
    prisma.conversation.create = jest
      .fn()
      .mockResolvedValue(mockConversationsData);
    prisma.message.create = jest.fn().mockResolvedValue(mockMessageData);
    prisma.conversation.findUnique = jest
      .fn()
      .mockResolvedValue(mockConversationsData);

    const result = await service.sendFirstMessage(
      user,
      'Test title',
      'Hello, World!',
      tags,
    );

    expect(prisma.conversation.create).toBeCalledTimes(1);
    expect(prisma.message.create).toBeCalledTimes(1);
    expect(result).toEqual(mockConversationsData);
  });

  it('should fail if conversation creation fails', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue(user);
    prisma.tag.findMany = jest.fn().mockResolvedValue([
      { id: '1', name: 'ACS' },
      { id: '2', name: 'CROP_PROTECTION' },
    ]);
    prisma.conversation.create = jest
      .fn()
      .mockRejectedValue(
        'Conversation could not be created due to an internal server error',
      );

    // Act & Assert
    await expect(
      service.sendFirstMessage(user, 'title', 'message', ['ACS']),
    ).rejects.toThrow(
      'Conversation could not be created due to an internal server error',
    );
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      prisma.conversation.findUnique = jest
        .fn()
        .mockResolvedValue(mockConversationsData);
      prisma.message.updateMany = jest.fn().mockResolvedValue({ count: 1 });
      prisma.message.create = jest.fn().mockResolvedValue(mockMessageData);
      prisma.message.findUnique = jest.fn().mockResolvedValue(mockMessageData);

      const result = await service.sendMessage(
        user,
        'Test message',
        'conversationId1',
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockMessageData);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.sendMessage(user, 'Test message', 'conversationId1'),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      prisma.conversation.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.sendMessage(user, 'Test message', 'nonexistentConversationId'),
      ).rejects.toThrow(new NotFoundException('Conversation not found'));
    });

    it('should throw NotFoundException if user is not part of the conversation', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ ...user, profession: 'farmer' });
      prisma.conversation.findUnique = jest.fn().mockResolvedValue({
        ...mockConversationsData,
        users: [], // User is not part of this array
      });

      await expect(
        service.sendMessage(user, 'Test message', 'conversationId1'),
      ).rejects.toThrow(new NotFoundException('User not in conversation'));
    });
  });

  describe('sendReactionToMessage', () => {
    it('should successfully set a reaction on a message', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'userId1', profession: 'farmer' });
      prisma.message.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'messageId1', isLiked: false });

      prisma.message.update = jest
        .fn()
        .mockResolvedValue({ id: 'messageId1', isLiked: true });

      const result = await service.sendReactionToMessage(
        'userId1',
        'messageId1',
        true,
      );

      expect(result).toBeDefined();
      expect(result.isLiked).toBeTruthy();
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.sendReactionToMessage('userId1', 'messageId1', true),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw UnauthorizedException if the user is not a farmer', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'userId1', profession: 'agronomist' });

      await expect(
        service.sendReactionToMessage('userId1', 'messageId1', true),
      ).rejects.toThrow(new UnauthorizedException('User is not a farmer'));
    });

    it('should throw NotFoundException if the message does not exist', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'userId1', profession: 'farmer' });
      prisma.message.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.sendReactionToMessage('userId1', 'messageId1', true),
      ).rejects.toThrow(new NotFoundException('Message not found'));
    });

    it('should throw NotFoundException if the reaction is already set', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'userId1', profession: 'farmer' });
      prisma.message.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'messageId1', isLiked: true });

      await expect(
        service.sendReactionToMessage('userId1', 'messageId1', true),
      ).rejects.toThrow(new NotFoundException('Reaction already set'));
    });
  });
});
