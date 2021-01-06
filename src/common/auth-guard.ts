import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtServices } from 'src/jwt/jwt.services';
import { UserServices } from 'src/user/user.services';
import { AllowedAuthRole } from './auth-roles';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtServices: JwtServices,
    private readonly userServices: UserServices,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedAuthRole>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlCtx = GqlExecutionContext.create(context).getContext();
    if (gqlCtx.token) {
      const decoded = this.jwtServices.decodeJwtToken(gqlCtx.token);
      if (decoded) {
        const userObj = await this.userServices.findUserById({
          userId: decoded['id'],
        });
        const user = userObj.user;
        gqlCtx.user = user;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
