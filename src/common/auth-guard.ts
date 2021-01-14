import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtServices } from 'src/jwt/jwt.services';
import { UserServices } from 'src/user/user.services';
import { AuthRole } from './auth-roles';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtServices: JwtServices,
    private readonly userServices: UserServices,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AuthRole>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const gqlCtx = GqlExecutionContext.create(context).getContext();
    try {
      if (gqlCtx.token) {
        const decoded = this.jwtServices.decodeJwtToken(gqlCtx.token);
        if (decoded['error']) {
          return false;
        }
        if (decoded) {
          const { ok, error, user } = await this.userServices.findUserById({
            userId: decoded['id'],
          });
          if (!ok && error) {
            return false;
          }
          gqlCtx.user = user;
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
