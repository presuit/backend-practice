import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Msg } from './msg.entity';

@InputType('MsgRoomEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class MsgRoom extends Common {
  @Field((type) => [User])
  @ManyToMany((type) => User, (user) => user.msgRooms)
  participants: User[];

  @Field((type) => [Msg], { nullable: true })
  @OneToMany((type) => Msg, (msg) => msg.msgRoom, { nullable: true })
  msgs?: Msg[];

  @Field((type) => Boolean, { defaultValue: false })
  @Column({ default: false })
  deleted: boolean;

  @Field((type) => Product)
  @OneToOne((type) => Product, (product) => product.msgRoom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;
}
