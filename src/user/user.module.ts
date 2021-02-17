import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { EmailServices } from 'src/email/email.services';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { Wallet } from './entities/wallet.entity';
import { UserResolvers, WalletResolvers } from './user.resolvers';
import { UserServices } from './user.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification, Wallet]),
    EmailModule,
  ],
  providers: [UserResolvers, UserServices, WalletResolvers],
  exports: [UserServices],
})
export class UserModule {}
