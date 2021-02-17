import { CommonOutput } from 'src/common/dtos/common.dto';

export class SendVerifEamilInput {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export class SendVerifEamilOutput extends CommonOutput {}
