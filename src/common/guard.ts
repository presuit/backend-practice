import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtServices } from 'src/jwt/jwt.services';
import { UserServices } from 'src/user/user.services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtServices: JwtServices,
    private readonly userServices: UserServices,
  ) {}
  async canActivate(context: ExecutionContext) {
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
      }
      return false;
    }
    return true;
  }
}
