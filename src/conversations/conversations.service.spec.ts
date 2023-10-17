import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { ConversationsService } from './conversations.service';
import { UserEntity } from 'src/core/decorators/user.decorator';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

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

const mockeFullUserFarmer: User = {
  id: 'user-id-2',
  name: 'User 2',
  email: '',
  password: '',
  profession: 'farmer',
  createdAt: new Date(),
  temporaryPassword: '',
  temporaryPasswordExpiry: new Date(),
  updatedAt: new Date(),
};

const mockConversationsData = [
  {
    id: 'conv1',
    title: 'Conversation 1',
    tags: ['tag1'],
    messages: [],
    users: [mockUserData1, mockUserData2],
    author: mockeFullUserAgronomist,
  },
  {
    id: 'conv2',
    title: 'Conversation 2',
    tags: ['tag1', 'tag2'],
    messages: [],
    users: [mockUserData2],
    author: mockeFullUserAgronomist,
  },
];

describe('ConversationsService', () => {
  let conversationsService: ConversationsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationsService, PrismaService],
    }).compile();

    conversationsService =
      module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.$disconnect();
  });

  it('should return a list of conversations for a user', async () => {
    prismaService.conversation.findMany = jest
      .fn()
      .mockResolvedValue(mockConversationsData);

    const conversations = await conversationsService.getUserConversations(
      mockUserData1,
    );

    expect(conversations).toEqual(mockConversationsData);
    expect(prismaService.conversation.findMany).toHaveBeenCalledWith({
      where: {
        users: {
          some: {
            id: mockUserData1.userId,
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
  });

  it('should return an empty list if the user has no conversations', async () => {
    // Mocking the Prisma call for user with no conversations
    prismaService.conversation.findMany = jest.fn().mockResolvedValue([]);

    const conversations = await conversationsService.getUserConversations(
      mockUserData1,
    );

    expect(conversations).toEqual([]);
  });

  describe('getAllUnansweredConversations', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });

    afterEach(async () => {
      await prismaService.$disconnect();
    });

    it('should retrieve all conversations with unanswered messages for an agronomist user', async () => {
      // Mock the prismaService to return a valid user and conversations
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserAgronomist);
      prismaService.conversation.findMany = jest
        .fn()
        .mockResolvedValue(mockConversationsData);

      const result = await conversationsService.getAllUnansweredConversations(
        mockUserData1,
      );

      expect(result).toEqual(mockConversationsData);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.conversation.findMany).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      // Mock the prismaService to simulate that the user does not exist
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        conversationsService.getAllUnansweredConversations(mockUserData1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an UnauthorizedException if the user is not an agronomist', async () => {
      // Mock the prismaService to return a user that is not an agronomist
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserFarmer);

      await expect(
        conversationsService.getAllUnansweredConversations(mockUserData1),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle the scenario when there are no unanswered conversations', async () => {
      // Mock the prismaService to return a valid user and an empty list of conversations
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserAgronomist);
      prismaService.conversation.findMany = jest.fn().mockResolvedValue([]);

      const result = await conversationsService.getAllUnansweredConversations(
        mockUserData1,
      );

      expect(result).toEqual([]);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.conversation.findMany).toHaveBeenCalled();
    });
  });

  describe('getAllAnsweredConversations', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });

    afterEach(async () => {
      await prismaService.$disconnect();
    });

    it('should retrieve all conversations with answered messages for an agronomist user', async () => {
      // Mock the prismaService to return a valid user and conversations
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserAgronomist);
      prismaService.conversation.findMany = jest
        .fn()
        .mockResolvedValue(mockConversationsData);

      const result = await conversationsService.getAllAnsweredConversations(
        mockUserData1,
      );

      expect(result).toEqual(mockConversationsData);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.conversation.findMany).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      // Mock the prismaService to simulate that the user does not exist
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        conversationsService.getAllAnsweredConversations(mockUserData1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an UnauthorizedException if the user is not an agronomist', async () => {
      // Mock the prismaService to return a user that is not an agronomist
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserFarmer);

      await expect(
        conversationsService.getAllAnsweredConversations(mockUserData1),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle the scenario when there are no answered conversations', async () => {
      // Mock the prismaService to return a valid user and an empty list of conversations
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserAgronomist);
      prismaService.conversation.findMany = jest.fn().mockResolvedValue([]);

      const result = await conversationsService.getAllAnsweredConversations(
        mockUserData1,
      );

      expect(result).toEqual([]);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.conversation.findMany).toHaveBeenCalled();
    });
  });

  describe('getConversationById', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });

    it('should retrieve a conversation by ID if the user is authorized and the conversation exists', async () => {
      // Mock the prismaService to return a valid conversation and user
      prismaService.conversation.findUnique = jest
        .fn()
        .mockResolvedValue(mockConversationsData[0]);
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserAgronomist);

      const result = await conversationsService.getConversationById(
        mockUserData1,
        'conv1', // assuming 'conv1' is an existing conversation ID
      );

      expect(result).toEqual(mockConversationsData[0]);
      expect(prismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conv1' },
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
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserData1.userId },
        select: { profession: true },
      });
    });

    it('should throw a NotFoundException if the conversation does not exist', async () => {
      // Mock the prismaService to simulate non-existing conversation
      prismaService.conversation.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        conversationsService.getConversationById(mockUserData1, 'wrong-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an UnauthorizedException if the user is a farmer and not part of the conversation', async () => {
      // Mock the prismaService to return a conversation and a user who is a farmer
      prismaService.conversation.findUnique = jest
        .fn()
        .mockResolvedValue(mockConversationsData[0]);
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserFarmer);

      await expect(
        conversationsService.getConversationById(mockUserData2, 'conv1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should allow farmers who are part of the conversation to access it', async () => {
      // Create a mock conversation with the farmer as a participant
      const mockConversationWithFarmer = {
        ...mockConversationsData[0],
        users: [mockeFullUserFarmer],
      };
      prismaService.conversation.findUnique = jest
        .fn()
        .mockResolvedValue(mockConversationWithFarmer);
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockeFullUserFarmer);

      const result = await conversationsService.getConversationById(
        mockUserData2,
        'conv1',
      );

      expect(result).toEqual(mockConversationWithFarmer);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserData2.userId },
        select: { profession: true },
      });
    });
  });
});
