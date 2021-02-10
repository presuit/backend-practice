import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './email.constants';
import { EmailModuleOption } from './email.interfaces';
import { EmailServices } from './email.services';

@Global()
@Module({})
export class EmailModule {
  static forRoot(options: EmailModuleOption): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        EmailServices,
      ],
      exports: [EmailServices],
    };
  }
}
