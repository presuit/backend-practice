import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, OneToOne, RelationId } from 'typeorm';

@InputType('WalletEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Wallet extends Common {
  @Field((type) => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  point: number;

  @Field((type) => User)
  @OneToOne((type) => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((wallet: Wallet) => wallet.owner)
  ownerId: number;
}
