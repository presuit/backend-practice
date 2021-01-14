import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Wallet } from '../entities/wallet.entity';

@ObjectType()
export class MyWalletOutput extends CommonOutput {
  @Field((type) => Wallet, { nullable: true })
  wallet?: Wallet;
}
