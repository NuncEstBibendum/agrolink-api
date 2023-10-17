import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockImplementation(),
              findUniqueOrThrow: jest.fn().mockImplementation(),
              update: jest.fn().mockImplementation(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserData = { name: 'test user' };

      prisma.user.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValueOnce({ id: userId, name: 'old name' });
      prisma.user.update = jest
        .fn()
        .mockResolvedValueOnce({ ...updateUserData });

      await service.updateUser(userId, updateUserData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { ...updateUserData },
      });
    });
  });

  describe('retrieveOneUser', () => {
    it('should throw an error if user retrieval fails', async () => {
      const userId = 'unknown';

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.retrieveOneUser(userId)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should handle exceptions or errors during user retrieval', async () => {
      const userId = 'errorCase';

      prisma.user.findUnique = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.retrieveOneUser(userId)).rejects.toThrow(
        new Error('Unexpected error'),
      );
    });
  });
});
