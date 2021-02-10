import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class RequestSmsInput {
  @Field((type) => String)
  phoneNumber: string;
}

@ObjectType()
export class RequestSmsOutput extends CommonOutput {}
