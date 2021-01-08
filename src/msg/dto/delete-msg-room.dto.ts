import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { MsgRoom } from '../entities/msg-room.entity';

@InputType()
export class DeleteMsgRoomInput extends PickType(MsgRoom, ['id']) {}

@ObjectType()
export class DeleteMsgRoomOutput extends CommonOutput {}
