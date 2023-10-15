import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  exports: [UsersService],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
