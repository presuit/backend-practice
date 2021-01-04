import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/common/auth-user';
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

  @Query((returns) => String)
  sayHello(): string {
    return 'Hello world';
  }

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

  @Mutation((returns) => EditProfileOutput)
  editProfile(
    @Args('input') input: EditProfileInput,
    @AuthUser() user: User,
  ): Promise<EditProfileOutput> {
    return this.userServices.editProfile(input, user);
  }

  @Query((returns) => FindUserByIdOutput)
  findUserById(
    @Args('input') input: FindUserByIdInput,
  ): Promise<FindUserByIdOutput> {
    return this.userServices.findUserById(input);
  }
}
