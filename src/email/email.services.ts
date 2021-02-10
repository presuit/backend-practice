import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './email.constants';
import { EmailModuleOption, EmailVar } from './email.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class EmailServices {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOption,
  ) {}

  private async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    console.log(subject, to, template, emailVars);

    const form = new FormData();
    form.append('from', `Admin from  <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('template', template);
    form.append('subject', subject);
    emailVars.forEach((each) => {
      console.log(each);
      return form.append(`v:${each.key}`, each.value);
    });

    try {
      const res = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          method: 'POST',
          body: form,
        },
      );
      console.log(res.body);
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    return this.sendEmail('로그인을 위한 인증을 해주세요', email, 'verifcode', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
