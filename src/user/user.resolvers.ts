import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { AddPointInput, AddPointOutput } from './dtos/add-point.dto';
import {
  ConfirmVerificationCodeInput,
  ConfirmVerificationCodeOutput,
} from './dtos/confirm-verification-code.dto';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import {
  FindUserByIdInput,
  FindUserByIdOutput,
} from './dtos/find-user-by-id.dto';
import {
  FindWalletByUserIdInput,
  FindWalletByUserIdOutput,
} from './dtos/find-wallet-By-userId.dto';
import { LogInInput, LogInOutput } from './dtos/log-in.dto';
import { MeOutput } from './dtos/me.dto';
import { MyWalletOutput } from './dtos/my-wallett.dto';
import {
  RequestNewVerificationInput,
  RequestNewVerificationOutput,
} from './dtos/request-new-verification.dto';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
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
    @Args('input') input: ConfirmVerificationCodeInput,
  ): Promise<ConfirmVerificationCodeOutput> {
    return this.userServices.confirmVerificationCode(user, input);
  }

  @Roles(['Any'])
  @Query((returns) => MeOutput)
  me(@AuthUser() user: User): Promise<MeOutput> {
    return this.userServices.me(user);
  }

  @Roles(['Any'])
  @Mutation((returns) => RequestNewVerificationOutput)
  requestNewVerification(
    @AuthUser() user: User,
    @Args('input') input: RequestNewVerificationInput,
  ): Promise<RequestNewVerificationOutput> {
    return this.userServices.requestNewVerification(user, input);
  }
}

@Resolver((of) => Wallet)
export class WalletResolvers {
  constructor(private readonly userServices: UserServices) {}

  @Roles(['Any'])
  @Query((returns) => MyWalletOutput)
  myWallet(@AuthUser() user: User): Promise<MyWalletOutput> {
    return this.userServices.myWallet(user);
  }

  @Roles(['Any'])
  @Query((returns) => FindWalletByUserIdOutput)
  findWalletByUserId(
    @AuthUser() user: User,
    @Args('input') input: FindWalletByUserIdInput,
  ): Promise<FindWalletByUserIdOutput> {
    return this.userServices.findWalletByUserId(user, input);
  }

  @Roles(['Any'])
  @Mutation((returns) => AddPointOutput)
  addPoint(
    @AuthUser() user: User,
    @Args('input') input: AddPointInput,
  ): Promise<AddPointOutput> {
    return this.userServices.addPoint(user, input);
  }
}
