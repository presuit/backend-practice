import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtOptions, JWT_OPTIONS } from './jwt.interfaces';
import { JwtServices } from './jwt.services';

@Global()
@Module({})
export class JwtModule {
  static forRoot(options: JwtOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [JwtServices, { provide: JWT_OPTIONS, useValue: options }],
      exports: [JwtServices],
    };
  }
}
