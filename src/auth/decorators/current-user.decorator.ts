import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserData = {
  id: number;
  email: string;
  nombre: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserData => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
