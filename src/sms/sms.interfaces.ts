interface MsgTypes {
  SMS: 'SMS';
  LMS: 'LMS';
  MMS: 'MMS';
  ATA: 'ATA';
  CTA: 'CTA';
}

type AllowedMsgTypes = keyof MsgTypes;

export interface MsgProps {
  text: string;
  type: AllowedMsgTypes;
  to: string;
  from: string;
}

export const SMS_OPTIONS = 'SMS_OPTIONS';

export interface SmsOptions {
  apiKey: string;
  apiSecret: string;
}
