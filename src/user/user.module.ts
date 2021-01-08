import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { Wallet } from './entities/wallet.entity';
import { UserResolvers } from './user.resolvers';
import { UserServices } from './user.services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, Wallet])],
  providers: [UserResolvers, UserServices],
  exports: [UserServices],
})
export class UserModule {}
