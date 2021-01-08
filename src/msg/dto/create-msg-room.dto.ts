import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from 'src/user/entities/user.entity';
import { MsgRoom } from '../entities/msg-room.entity';

@InputType()
export class CreateMsgRoomInput extends PickType(MsgRoom, ['participants']) {
  @Field((type) => Int)
  productId: number;
}

@ObjectType()
export class CreateMsgRoomOutput extends CommonOutput {}
