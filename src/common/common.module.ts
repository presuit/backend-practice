import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard';

@Global()
@Module({
  //   providers: [
  //     {
  //       provide: APP_GUARD,
  //       useClass: AuthGuard,
  //     },
  //   ],
})
export class CommonModule {}
