import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class RequestNewVerificationInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class RequestNewVerificationOutput extends CommonOutput {}
