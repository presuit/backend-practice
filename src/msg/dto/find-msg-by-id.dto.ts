import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Msg } from '../entities/msg.entity';

@InputType()
export class FindMsgByIdInput extends PickType(Msg, ['id']) {}

@ObjectType()
export class FindMsgByIdOutput extends CommonOutput {
  @Field((type) => Msg, { nullable: true })
  msg?: Msg;
}
