import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtServices } from 'src/jwt/jwt.services';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LogInInput, LogInOutput } from './dtos/log-in.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserServices {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtServices: JwtServices,
  ) {}

  async createAccount({
    email,
    password,
    username,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const user = await this.users.findOne({ email });
      if (user) {
        return {
          ok: false,
          error: '같은 이메일을 사용하는 유저가 있습니다.',
        };
      }
      const newUser = await this.users.save(
        this.users.create({ email, password, username }),
      );
      await this.verifications.save(
        this.verifications.create({ user: newUser }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '회원가입 실패',
      };
    }
  }

  async logIn({ email, password }: LogInInput): Promise<LogInOutput> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: '해당 이메일을 가지고 있는 사용자가 없습니다.',
        };
      }
      const isPwdValid = await user.validatePassword(password);
      if (!isPwdValid) {
        return {
          ok: false,
          error: '비밀번호가 일치하지 않습니다.',
        };
      }
      const token = this.jwtServices.generateJwtToken({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      return {
        ok: false,
        error: '로그인 실패',
      };
    }
  }
}
