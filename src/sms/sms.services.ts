import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// @ts-ignore
import * as solapi from 'solapi';
import { User } from 'src/user/entities/user.entity';
import { Verification } from 'src/user/entities/verification.entity';
import { Repository } from 'typeorm';
import { RequestSmsInput, RequestSmsOutput } from './dtos/requestSms.dto';
import { MsgProps, SmsOptions, SMS_OPTIONS } from './sms.interfaces';

@Injectable()
export class SmsServices {
  constructor(
    @Inject(SMS_OPTIONS) private readonly options: SmsOptions,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
  ) {
    solapi.config.init({
      apiKey: options.apiKey,
      apiSecret: options.apiSecret,
    });
  }
  async requestSms(
    user: User,
    { phoneNumber }: RequestSmsInput,
  ): Promise<RequestSmsOutput> {
    try {
      const userVerification = await this.verifications.findOne({
        where: { user: { id: user.id } },
      });
      if (!userVerification) {
        return {
          ok: false,
          error: '유저 정보에 Verification 값이 존재하지 않습니다.',
        };
      }
      if (phoneNumber) {
        const typedPhoneNumber = phoneNumber.trim();
        while (typedPhoneNumber.indexOf('-') > -1) {
          typedPhoneNumber.replace('-', '');
        }
        await this.verifications.save([
          {
            id: userVerification.id,
            phoneNumber: typedPhoneNumber,
          },
        ]);
        console.log(typedPhoneNumber);
        // const msgProps: MsgProps = {
        //   from: this.options.to,
        //   to: typedPhoneNumber,
        //   text: `해당 URL을 클릭하여 인증을 마쳐주세요. http://localhost:3000/validate-code?code=${userVerification.code}`,
        // };
        // await solapi.Group.sendSimpleMessage(msgProps);
        return {
          ok: true,
        };
      } else {
        return {
          ok: false,
          error: '핸드폰 번호의 형태가 이상합니다.',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Sms을 보내는데 실패했습니다.',
      };
    }
  }
}
