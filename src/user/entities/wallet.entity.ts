import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm';

@InputType('WalletEntityHistoryInput', { isAbstract: true })
@ObjectType()
export class WalletHistory {
  @Field((type) => Int)
  productId?: number;

  @Field((type) => Number)
  purchaseDate?: number;

  @Field((type) => Boolean)
  canIRefund?: boolean;

  @Field((type) => Int)
  price?: number;
}

@InputType('WalletEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Wallet extends Common {
  @Field((type) => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  point: number;

  @Field((type) => User)
  @OneToOne((type) => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @RelationId((wallet: Wallet) => wallet.owner)
  ownerId: number;

  @Field((type) => [WalletHistory], { nullable: true })
  @Column({ type: 'json', nullable: true })
  histories?: WalletHistory[];
}
