import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { MsgRoom } from '../entities/msg-room.entity';

@ObjectType()
export class AllMsgRoomsOutput extends CommonOutput {
  @Field((type) => [MsgRoom], { nullable: true })
  msgRooms?: MsgRoom[];
}
