import { DynamicModule, Global, Module } from '@nestjs/common';
import { SmsOptions, SMS_OPTIONS } from './sms.interfaces';
import { SmsServices } from './sms.services';
import { SmsResolvers } from './sms.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from 'src/user/entities/verification.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Verification])],
  providers: [SmsServices],
  exports: [SmsServices],
})
export class SmsModule {
  static forRoot(options: SmsOptions): DynamicModule {
    return {
      module: SmsModule,
      imports: [TypeOrmModule.forFeature([Verification])],
      providers: [
        SmsServices,
        SmsResolvers,
        { provide: SMS_OPTIONS, useValue: options },
      ],
      exports: [SmsServices],
    };
  }
}
