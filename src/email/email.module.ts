import { DynamicModule, Global, Module } from '@nestjs/common';
import { EmailServices } from './email.services';
import {
  EMAIL_OPTIONS,
  EmailOptions,
  SMTP_OPTIONS,
  SMTPConfigParams,
} from './email.interfaces';

@Global()
@Module({})
export class EmailModule {
  static forRoot(
    options: EmailOptions,
    smtpOptions: SMTPConfigParams,
  ): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        EmailServices,
        { provide: EMAIL_OPTIONS, useValue: options },
        { provide: SMTP_OPTIONS, useValue: smtpOptions },
      ],
      exports: [EmailServices],
    };
  }
}
