import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type UserEntity = {
  userId: string;
};

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return null;
    }
    return request.user;
  },
);
