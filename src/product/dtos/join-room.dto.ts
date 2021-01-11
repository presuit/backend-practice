import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class JoinRoomInput {
  @Field((type) => Int)
  userId: number;

  @Field((type) => Int)
  productId: number;

  @Field((type) => Int)
  price: number;
}

@ObjectType()
export class JoinRoomOutput extends CommonOutput {
  @Field((type) => Boolean, { defaultValue: false })
  soldout?: boolean;
}
