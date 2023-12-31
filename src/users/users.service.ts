import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUser(id: string, data: UpdateUserDto) {
    await this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });

    await this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
      },
    });
  }

  async retrieveOneUser(id: string) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profession: true,
      },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    return foundUser;
  }
}
