import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from 'src/jwt/jwt.module';
import { JwtServices } from 'src/jwt/jwt.services';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserResolvers } from './user.resolvers';
import { UserServices } from './user.services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UserResolvers, UserServices],
  exports: [],
})
export class UserModule {}
