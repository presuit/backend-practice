import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from 'src/product/entities/product.entity';
import { Room } from 'src/room/entities/room.entity';
import { Msg } from 'src/msg/entities/msg.entity';

@InputType('UserEntityInput', { isAbstract: true })
@Entity()
@ObjectType()
export class User extends Common {
  @Column({ unique: true })
  @Field((type) => String)
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  password: string;

  @Column({ default: false })
  @Field((type) => Boolean, { defaultValue: false })
  isVerified: boolean;

  @Column()
  @Field((type) => String)
  username: string;

  @OneToMany((type) => Product, (product) => product.seller, { nullable: true })
  @Field((type) => [Product], { nullable: true })
  sellingProducts?: Product[];

  @OneToMany((type) => Product, (product) => product.buyer, { nullable: true })
  @Field((type) => [Product], { nullable: true })
  buyingProducts?: Product[];

  @ManyToMany((type) => Room, (room) => room.participants, { nullable: true })
  @Field((type) => [Room], { nullable: true })
  rooms?: Room[];

  @Field((type) => [Msg], { nullable: true })
  @OneToOne((type) => Msg, { nullable: true })
  msgs?: Msg[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(targetPwd: string): Promise<boolean> {
    if (this.password) {
      return await bcrypt.compare(targetPwd, this.password);
    }
    return false;
  }
}
