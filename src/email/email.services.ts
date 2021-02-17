import { Inject, Injectable } from '@nestjs/common';
import {
  SendVerifEamilInput,
  SendVerifEamilOutput,
} from './dtos/send-verif-emil.dto';
import {
  EMAIL_OPTIONS,
  EmailOptions,
  SMTP_OPTIONS,
  SMTPConfigParams,
} from './email.interfaces';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailServices {
  constructor(
    @Inject(EMAIL_OPTIONS) private readonly options: EmailOptions,
    @Inject(SMTP_OPTIONS) private readonly smtpOptions: SMTPConfigParams,
  ) {}

  sendVerifyEmail({
    html,
    subject,
    to,
  }: SendVerifEamilInput): SendVerifEamilOutput {
    try {
      const msg: SendVerifEamilInput = {
        from: this.options.email,
        to,
        html,
        subject,
      };

      const transporter = nodemailer.createTransport(this.smtpOptions);
      transporter.sendMail(msg);
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '이메일 전송 실패',
      };
    }
  }
}
