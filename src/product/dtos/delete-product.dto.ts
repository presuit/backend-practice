import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class DeleteProductInput {
  @Field((type) => Int)
  productId: number;
}

@ObjectType()
export class DeleteProductOutput extends CommonOutput {}
