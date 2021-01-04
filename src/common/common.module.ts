import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Verification } from 'src/user/entities/verification.entity';
import { UserModule } from 'src/user/user.module';
import { UserServices } from 'src/user/user.services';
import { AuthGuard } from './guard';

@Global()
@Module({
  imports: [UserModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class CommonModule {}
