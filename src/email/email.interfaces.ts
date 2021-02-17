export const EMAIL_OPTIONS = 'EMAIL_OPTIONS';
export const SMTP_OPTIONS = 'SMTP_OPTIONS';

export interface EmailOptions {
  email: string;
  password: string;
}

export interface SMTPConfigParams {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}
