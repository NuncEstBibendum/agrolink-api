import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './core/guards/jwtAuth.guard';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { ConversationsModule } from './conversations/conversations.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    JwtModule,
    ConversationsModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    PrismaService,
  ],
})
export class AppModule {}
