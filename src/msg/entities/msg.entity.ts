import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@InputType('MsgEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Msg extends Common {
  @Field((type) => String)
  @Column()
  msgText: string;

  @Field((type) => User)
  @OneToOne((type) => User)
  @JoinColumn()
  from: User;

  @Field((type) => User)
  @OneToOne((type) => User)
  @JoinColumn()
  to: User;
}
