import { DynamicModule, Global, Module } from '@nestjs/common';
import { SmsOptions, SMS_OPTIONS } from './sms.interfaces';
import { SmsServices } from './sms.services';

@Global()
@Module({
  providers: [SmsServices],
  exports: [SmsServices],
})
export class SmsModule {
  static forRoot(options: SmsOptions): DynamicModule {
    return {
      module: SmsModule,
      providers: [SmsServices, { provide: SMS_OPTIONS, useValue: options }],
      exports: [SmsServices],
    };
  }
}
