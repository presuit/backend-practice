import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { extend } from '@nestjs/graphql/dist/utils';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Msg } from '../entities/msg.entity';

@InputType()
export class CreateMsgInput extends PickType(Msg, ['msgText']) {
  @Field((type) => Int)
  toId: number;

  @Field((type) => Int)
  fromId: number;

  @Field((type) => Int)
  msgRoomId: number;
}

@ObjectType()
export class CreateMsgOutput extends CommonOutput {}
