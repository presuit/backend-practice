import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReceiveMsgCountOutput {
  @Field((type) => Int)
  id: number;

  @Field((type) => Int)
  msgCounts: number;

  @Field((type) => Date)
  createdAt: Date;
}
