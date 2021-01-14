import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Wallet } from '../entities/wallet.entity';

@InputType()
export class FindWalletByUserIdInput {
  @Field((type) => Int)
  userId: number;
}

@ObjectType()
export class FindWalletByUserIdOutput extends CommonOutput {
  @Field((type) => Wallet, { nullable: true })
  wallet?: Wallet;
}
