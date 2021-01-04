import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtServices } from 'src/jwt/jwt.services';
import { MsgProps } from 'src/sms/sms.interfaces';
import { SmsServices } from 'src/sms/sms.services';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import {
  FindUserByIdInput,
  FindUserByIdOutput,
} from './dtos/find-user-by-id.dto';
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
    private readonly SmsServices: SmsServices,
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
      const newVerification = await this.verifications.save(
        this.verifications.create({ user: newUser }),
      );
      const msgObj: MsgProps = {
        type: 'SMS',
        to: '01031773516',
        from: '01031773516',
        text: `반갑소 찬공, 찬공의 확인 코드는 ${newVerification.code} 이오`,
      };
      await this.SmsServices.sendMsg(msgObj);
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

  async editProfile(
    input: EditProfileInput,
    user: User,
  ): Promise<EditProfileOutput> {
    try {
      const inputUser = await this.users.findOne(input.userId);
      if (!inputUser) {
        return {
          ok: false,
          error: '요청하신 유저가 존재하지 않습니다.',
        };
      }
      if (inputUser.id !== user.id) {
        return {
          ok: false,
          error: '다른 유저의 정보에 접근할 수 없습니다.',
        };
      }
      if (input.password) {
        user.password = input.password;
      }
      if (input.username) {
        user.username = input.username;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '프로필 업데이트에 실패했습니다.',
      };
    }
  }

  async findUserById({
    userId,
  }: FindUserByIdInput): Promise<FindUserByIdOutput> {
    try {
      const user = await this.users.findOne(userId);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 아이디를 가진 유저를 찾을 수 없습니다.',
      };
    }
  }
}
