import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { MsgRoom } from './msg-room.entity';

@InputType('MsgEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Msg extends Common {
  @Field((type) => String)
  @Column()
  msgText: string;

  @Field((type) => User)
  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  from: User;

  @Field((type) => User)
  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  to: User;

  @Field((type) => MsgRoom)
  @ManyToOne((type) => MsgRoom, (msgRoom) => msgRoom.msgs, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  msgRoom: MsgRoom;
}
