import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions, JWT_OPTIONS } from './jwt.interfaces';
import { IPayload } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtServices {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtOptions) {}

  generateJwtToken(payload: IPayload): string {
    return jwt.sign(payload, this.options.secret, { expiresIn: '1 days' });
  }

  decodeJwtToken(token: string): object | string {
    try {
      return jwt.verify(token, this.options.secret);
    } catch (error) {
      return { error };
    }
  }
}
