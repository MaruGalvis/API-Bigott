import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: User = request.user;

  if (!user) {
    throw new InternalServerErrorException('User not found in request (did you forget @Auth()?)');
  }

  return data ? user[data] : user;
});
