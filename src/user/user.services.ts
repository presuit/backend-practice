import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailServices } from 'src/email/email.services';
import { JwtServices } from 'src/jwt/jwt.services';
import { Repository } from 'typeorm';
import { AddPointInput, AddPointOutput } from './dtos/add-point.dto';
import {
  ConfirmVerificationCodeInput,
  ConfirmVerificationCodeOutput,
} from './dtos/confirm-verification-code.dto';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import {
  FindUserByIdInput,
  FindUserByIdOutput,
} from './dtos/find-user-by-id.dto';
import {
  FindWalletByUserIdInput,
  FindWalletByUserIdOutput,
} from './dtos/find-wallet-By-userId.dto';
import { LogInInput, LogInOutput } from './dtos/log-in.dto';
import { MeOutput } from './dtos/me.dto';
import { MyWalletOutput } from './dtos/my-wallett.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class UserServices {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtServices: JwtServices,
    private readonly emailServices: EmailServices,
  ) {}

  async me(user: User): Promise<MeOutput> {
    try {
      const me = await this.users.findOneOrFail(
        { id: user.id },
        { relations: ['wallet', 'msgRooms'] },
      );
      return {
        ok: true,
        user: me,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '로그인한 유저를 찾을 수 없습니다.',
      };
    }
  }

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
      this.emailServices.sendVerifyEmail({
        to: newUser.email,
        html: `<div>
          <h1> 😉 안녕하세요 테스트용 메일입니다</h1>  
          <h2 style="padding-bottom:10px;">아래의 링크를 클릭하여 인증을 마쳐주세요~🤞</h2>
          <a style="font-size:20px; margin-top:20px;margin-bottom:20px;padding:20px; background-color:dodgerblue;text-decoration:none;border-radius:10px;color:white;font-weight:600; " href="http://localhost:3000/validate-code/?code=${newVerification.code}">인증하기</a>
          <h2 style="padding-top:10px;">감사합니다~</h2>
        <div>`,
        subject: '[랜더미]이메일 인증 요청',
      });
      await this.wallets.save(this.wallets.create({ owner: newUser }));
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
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
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
      if (input.avatarImg) {
        user.avatarImg = input.avatarImg;
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
      const user = await this.users.findOneOrFail(
        { id: userId },
        { relations: ['sellingProducts'] },
      );
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

  async confirmVerificationCode(
    user: User,
    { code }: ConfirmVerificationCodeInput,
  ): Promise<ConfirmVerificationCodeOutput> {
    try {
      if (user.isVerified === true) {
        return {
          ok: false,
          error: '이미 인증 된 계정입니다.',
        };
      }
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (!verification) {
        return {
          ok: false,
          error: '해당 코드를 가진 Verification이 존재하지 않습니다.',
        };
      }
      if (verification.user.id !== user.id) {
        return {
          ok: false,
          error: '해당 코드는 당신의 Verification Code와 맞지 않습니다.',
        };
      }
      user.isVerified = true;
      await this.users.save(user);
      return {
        ok: true,
        userId: user.id,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Verification code 판별에 실패했습니다.',
      };
    }
  }

  async addPoint(
    user: User,
    { point, id: walletId }: AddPointInput,
  ): Promise<AddPointOutput> {
    try {
      const wallet = await this.wallets.findOne({ id: walletId });
      if (!wallet) {
        return {
          ok: false,
          error: '해당 아이디를 가진 wallet이 없습니다.',
        };
      }
      if (wallet.ownerId !== user.id) {
        return {
          ok: false,
          error:
            '현재 로그인한 유저의 아이디와 입력으로 들어온 아이디 값이 다릅니다.',
        };
      }
      if (point <= 0) {
        return {
          ok: false,
          error: '충전 될 포인트의 값은 0보다 작을 수 없습니다.',
        };
      }
      const addedPoint = wallet.point + point;
      await this.wallets.save([
        {
          id: walletId,
          point: addedPoint,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'wallet에 포인트를 충전하지 못했습니다.',
      };
    }
  }

  async findWalletByUserId(
    user: User,
    { userId }: FindWalletByUserIdInput,
  ): Promise<FindWalletByUserIdOutput> {
    try {
      const { ok, error, user: owner } = await this.findUserById({ userId });
      if (error) {
        return {
          ok,
          error,
        };
      }
      if (owner.id !== user.id) {
        return {
          ok: false,
          error: '로그인 한 유저와 입력된 유저가 다릅니다.',
        };
      }
      const wallet = await this.wallets.findOne({ id: owner.walletId });
      if (!wallet) {
        return {
          ok: false,
          error: '해당 유저의 wallet이 존재하지 않습니다.',
        };
      }
      if (wallet.histories) {
        wallet.histories.sort((a, b) => b.purchaseDate - a.purchaseDate);
      }
      return {
        ok: true,
        wallet,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: '해당 User의 wallet을 찾지 못했습니다.',
      };
    }
  }

  async myWallet(user: User): Promise<MyWalletOutput> {
    try {
      const { ok, error, wallet } = await this.findWalletByUserId(user, {
        userId: user.id,
      });
      if (!ok && error) {
        return {
          ok,
          error,
        };
      }
      return {
        ok: true,
        wallet,
      };
    } catch (err) {
      return {
        ok: false,
        error: '해당 user의 wallet을 찾지 못했습니다.',
      };
    }
  }
}
