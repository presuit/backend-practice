import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions, JWT_OPTIONS } from './jwt.interfaces';
import { IPayload } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtServices {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtOptions) {}

  generateJwtToken(payload: IPayload): string {
    return jwt.sign(payload, this.options.secret);
  }

  decodeJwtToken(token: string): object | string {
    return jwt.verify(token, this.options.secret);
  }
}
