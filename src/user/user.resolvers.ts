import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { ConfirmVerificationCodeOutput } from './dtos/confirm-verification-code.dto';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import {
  FindUserByIdInput,
  FindUserByIdOutput,
} from './dtos/find-user-by-id.dto';
import { LogInInput, LogInOutput } from './dtos/log-in.dto';
import { User } from './entities/user.entity';
import { UserServices } from './user.services';

@Resolver((of) => User)
export class UserResolvers {
  constructor(private readonly userServices: UserServices) {}

  @Mutation((returns) => CreateAccountOutput)
  createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userServices.createAccount(input);
  }

  @Mutation((returns) => LogInOutput)
  logIn(@Args('input') input: LogInInput): Promise<LogInOutput> {
    return this.userServices.logIn(input);
  }

  @Query((returns) => FindUserByIdOutput)
  findUserById(
    @Args('input') input: FindUserByIdInput,
  ): Promise<FindUserByIdOutput> {
    return this.userServices.findUserById(input);
  }

  @Roles(['Any'])
  @Mutation((returns) => EditProfileOutput)
  editProfile(
    @AuthUser() user: User,
    @Args('input') input: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.userServices.editProfile(input, user);
  }

  @Roles(['Any'])
  @Mutation((returns) => ConfirmVerificationCodeOutput)
  confirmVerificationCode(
    @AuthUser() user: User,
    @Args('code') code: string,
  ): Promise<ConfirmVerificationCodeOutput> {
    return this.userServices.confirmVerificationCode(user, code);
  }
}
