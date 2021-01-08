import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { MsgRoom } from '../entities/msg-room.entity';

@InputType()
export class FindMsgRoomByIdInput extends PickType(MsgRoom, ['id']) {}

@ObjectType()
export class FindMsgRoomByIdOutput extends CommonOutput {
  @Field((type) => MsgRoom, { nullable: true })
  msgRoom?: MsgRoom;
}
