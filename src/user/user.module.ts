import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { Wallet } from './entities/wallet.entity';
import { UserResolvers, WalletResolvers } from './user.resolvers';
import { UserServices } from './user.services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, Wallet])],
  providers: [UserResolvers, UserServices, WalletResolvers],
  exports: [UserServices],
})
export class UserModule {}
