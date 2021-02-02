import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MsgRoom } from './msg-room.entity';

@InputType('MsgEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Msg extends Common {
  @Field((type) => String)
  @Column()
  msgText: string;

  @Field((type) => Int)
  @Column()
  fromId: number;

  @Field((type) => Int)
  @Column()
  toId: number;

  @Field((type) => MsgRoom)
  @ManyToOne((type) => MsgRoom, (msgRoom) => msgRoom.msgs, {
    onDelete: 'CASCADE',
  })
  msgRoom: MsgRoom;
}
