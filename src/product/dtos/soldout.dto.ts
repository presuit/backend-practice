import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class SoldoutInput {
  @Field((type) => Int)
  buyerId: number;

  @Field((type) => Int)
  productId: number;
}

@ObjectType()
export class SoldoutOutput extends CommonOutput {}
