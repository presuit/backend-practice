import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { User } from 'src/user/entities/user.entity';
import { RequestSmsInput, RequestSmsOutput } from './dtos/requestSms.dto';
import { SmsServices } from './sms.services';

@Resolver()
export class SmsResolvers {
  constructor(private readonly smsServices: SmsServices) {}

  @Roles(['Any'])
  @Mutation((returns) => RequestSmsOutput)
  requestSms(
    @AuthUser() user: User,
    @Args('input') input: RequestSmsInput,
  ): Promise<RequestSmsOutput> {
    return this.smsServices.requestSms(user, input);
  }
}
