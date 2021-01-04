import { Inject, Injectable } from '@nestjs/common';
import * as solapi from 'solapi';
import { MsgProps, SmsOptions, SMS_OPTIONS } from './sms.interfaces';

@Injectable()
export class SmsServices {
  constructor(@Inject(SMS_OPTIONS) options: SmsOptions) {
    solapi.config.init({
      apiKey: options.apiKey,
      apiSecret: options.apiSecret,
    });
  }
  async sendMsg(msgObject: MsgProps) {
    try {
      const response = await solapi.Group.sendSimpleMessage(msgObject);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
