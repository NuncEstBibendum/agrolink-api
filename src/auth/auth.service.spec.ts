import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../shared/contact/email.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUserData: User = {
  id: 'user-id',
  email: 'test@example.com',
  password: 'hashedpassword',
  temporaryPassword: 'temporarypassword',
  temporaryPasswordExpiry: new Date(Date.now() + 1000 * 60),
  profession: 'developer',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(() => 'signed-jwt-token'),
    };

    const mockEmailService = {
      /* email service methods */
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(async () => {
    await prismaService.$disconnect();
  });

  describe('signin', () => {
    it('should return valid access token if credentials are valid', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare.mockResolvedValue(true); // Simulating valid password

      const result = await authService.signin({
        email: 'test@example.com',
        password: 'strongpassword',
      });

      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        email: mockUserData.email,
        profession: mockUserData.profession,
      });
    });

    it('should handle temporary password logic correctly', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUserData);
      prismaService.user.update = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare
        .mockResolvedValueOnce(false) // Simulating invalid main password
        .mockResolvedValueOnce(true); // Simulating valid temporary password

      const result = await authService.signin({
        email: 'test@example.com',
        password: 'temporarypassword',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserData.id },
        data: expect.any(Object),
      });

      expect(result.accessToken).toBeTruthy();
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare.mockResolvedValue(false); // Simulating invalid password

      await expect(
        authService.signin({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Wrong credentials');
    });

    it('should throw an UnauthorizedException if user does not exist', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null); // Simulating user not found

      await expect(
        authService.signin({
          email: 'nonexistent@example.com',
          password: 'any-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a valid JWT token', async () => {
      const userID = '123';
      const email = 'test@example.com';
      const profession = 'farmer';

      const result = await authService.login(userID, email, profession);

      const expectedResult = {
        accessToken: 'signed-jwt-token',
        email,
        profession,
      };

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: userID });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('isEmailFree', () => {
    it('should return true if email is not found in the database', async () => {
      prismaService.user.findFirst = jest.fn().mockResolvedValue(null); // Simulating no user found

      const result = await authService.isEmailFree('free@example.com');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'free@example.com', id: { not: undefined } },
      });
      expect(result).toEqual({ emailFree: true });
    });

    it('should return false if email is found in the database', async () => {
      prismaService.user.findFirst = jest
        .fn()
        .mockResolvedValue({ id: '123', email: 'taken@example.com' }); // Simulating user found

      const result = await authService.isEmailFree('taken@example.com');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'taken@example.com', id: { not: undefined } },
      });
      expect(result).toEqual({ emailFree: false });
    });

    it('should return true if the email belongs to the current user', async () => {
      const currentUserID = 'currentUserId';
      prismaService.user.findFirst = jest.fn().mockResolvedValue(null); // Simulating no other user found with the email

      const result = await authService.isEmailFree(
        'user@example.com',
        currentUserID,
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@example.com', id: { not: currentUserID } },
      });
      expect(result).toEqual({ emailFree: true });
    });
  });

  describe('updatePassword', () => {
    it('should throw a ConflictException if the new passwords do not match', async () => {
      await expect(
        authService.updatePassword(
          'validUserId',
          'oldPassword',
          'newPassword',
          'mismatchingNewPassword',
        ),
      ).rejects.toThrow(new ConflictException(`Passwords don't match`));
    });

    it('should throw an UnauthorizedException if the old password is incorrect', async () => {
      const userId = 'validUserId';
      prismaService.user.findUniqueOrThrow = jest.fn().mockResolvedValue({
        password: 'correctHashedPassword',
      });

      bcrypt.compare = jest.fn().mockResolvedValue(false); // Simulating incorrect old password

      await expect(
        authService.updatePassword(
          userId,
          'incorrectOldPassword',
          'newPassword',
          'newPassword',
        ),
      ).rejects.toThrow(new UnauthorizedException('Wrong password'));

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'incorrectOldPassword',
        'correctHashedPassword',
      );
    });

    it('should update the password successfully if the old password is correct and the new passwords match', async () => {
      const userId = 'validUserId';
      prismaService.user.findUniqueOrThrow = jest.fn().mockResolvedValue({
        password: 'correctHashedPassword',
      });

      bcrypt.compare = jest.fn().mockResolvedValue(true); // Simulating correct old password
      bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword'); // Simulating new hashed password

      prismaService.user.update = jest
        .fn()
        .mockResolvedValue({ id: userId, password: 'hashedNewPassword' }); // Simulating database update operation

      const result = await authService.updatePassword(
        userId,
        'oldPassword',
        'newPassword',
        'newPassword',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashedNewPassword' },
      });
      expect(result).toEqual({ id: userId, password: 'hashedNewPassword' });
    });
  });

  describe('createUser', () => {
    it('should throw a ConflictException if the email is already in use', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(false);

      await expect(
        authService.createUser({
          email: 'taken@example.com',
          name: 'Test User',
          password: 'testPassword',
          profession: 'testProfession',
        }),
      ).rejects.toThrow(
        new ConflictException(
          `An user already exists with email taken@example.com`,
        ),
      );
    });

    it('should create a user successfully if the email is not taken', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      prismaService.user.create = jest.fn().mockResolvedValue({
        id: 'newUserId',
        email: 'free@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        profession: 'testProfession',
      });

      const newUser = await authService.createUser({
        email: 'free@example.com',
        name: 'Test User',
        password: 'testPassword',
        profession: 'testProfession',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'free@example.com',
          name: 'Test User',
          password: 'hashedPassword',
          profession: 'testProfession',
        },
      });
      expect(newUser).toEqual({
        id: 'newUserId',
        email: 'free@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        profession: 'testProfession',
      });
    });
  });

  describe('updateUserEmail', () => {
    it('should throw a ConflictException if the email is already in use', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(false); // Simulate unavailable new email

      await expect(
        authService.updateUserEmail('validUserId', {
          email: 'taken@example.com',
          confirmEmail: 'taken@example.com',
          oldEmail: 'old@example.com',
          password: 'validPassword',
        }),
      ).rejects.toThrow(
        new ConflictException(
          `An user already exists with email taken@example.com`,
        ),
      );
    });

    it('should throw an UnauthorizedException if the old email is incorrect', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(true); // Simulate available new email
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        email: 'realOld@example.com', // The actual old email in the database
        password: 'hashedPassword',
      });

      await expect(
        authService.updateUserEmail('validUserId', {
          email: 'new@example.com',
          confirmEmail: 'new@example.com',
          oldEmail: 'wrongOld@example.com', // Incorrect old email provided
          password: 'validPassword',
        }),
      ).rejects.toThrow(new UnauthorizedException('Wrong email'));
    });

    it('should throw an UnauthorizedException if the password is wrong', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(true); // Simulate available new email
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        email: 'old@example.com',
        password: 'hashedPassword',
      });
      bcrypt.compare = jest.fn().mockResolvedValue(false); // Simulate incorrect password

      await expect(
        authService.updateUserEmail('validUserId', {
          email: 'new@example.com',
          confirmEmail: 'new@example.com',
          oldEmail: 'old@example.com',
          password: 'wrongPassword', // Incorrect password provided
        }),
      ).rejects.toThrow(new UnauthorizedException('Wrong password'));
    });

    it('should successfully update the email if validations pass', async () => {
      authService.isEmailFree = jest.fn().mockResolvedValue(true); // Simulate available new email
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        email: 'old@example.com',
        password: 'hashedPassword',
      });
      bcrypt.compare = jest.fn().mockResolvedValue(true); // Simulate correct password
      prismaService.user.update = jest.fn().mockResolvedValue({
        id: 'validUserId',
        email: 'new@example.com', // New email after update
      });

      const updatedUser = await authService.updateUserEmail('validUserId', {
        email: 'new@example.com',
        confirmEmail: 'new@example.com',
        oldEmail: 'old@example.com',
        password: 'validPassword',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'validUserId' },
        data: { email: 'new@example.com' },
      });
      expect(updatedUser).toEqual({
        id: 'validUserId',
        email: 'new@example.com',
      });
    });
  });

  describe('sendPasswordRecovery', () => {
    it('should generate a temporary password, update the user record, and send an email if the user exists', async () => {
      // Mocking the prismaService to simulate a successful update of user data
      prismaService.user.update = jest.fn().mockResolvedValue({
        id: 'validUserId',
      });

      // Mocking the emailService to simulate a successful email sending process
      emailService.sendMail = jest.fn().mockResolvedValue(true);

      await authService.sendPasswordRecovery({
        userEmail: 'existing@example.com',
      });
      expect(prismaService.user.update).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalled();
    });

    it('should silently handle the case where no user exists with the provided email', async () => {
      // Mocking the prismaService to simulate that no user was found and updated
      prismaService.user.update = jest.fn().mockRejectedValue(new Error());

      // Mocking the emailService, though it should not be called in this case
      emailService.sendMail = jest.fn();

      await authService.sendPasswordRecovery({
        userEmail: 'nonexistent@example.com',
      });

      expect(prismaService.user.update).toHaveBeenCalled();
      expect(emailService.sendMail).not.toHaveBeenCalled();
    });
  });
});
