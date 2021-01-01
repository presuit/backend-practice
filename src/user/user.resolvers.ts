import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
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
}
