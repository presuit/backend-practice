import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PubSub } from 'graphql-subscriptions';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from './auth-guard';

export const PUB_SUB = 'PUB_SUB';
const pubsub = new PubSub();

@Global()
@Module({
  imports: [UserModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: PUB_SUB,
      useValue: pubsub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
