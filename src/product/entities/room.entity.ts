import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@InputType('RoomEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Room extends Common {
  @Field((type) => Product)
  @OneToOne((type) => Product, (product) => product.room, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Field((type) => [User], { nullable: true })
  @ManyToMany((type) => User, (user) => user.rooms, { nullable: true })
  @JoinTable()
  participants?: User[];
}
