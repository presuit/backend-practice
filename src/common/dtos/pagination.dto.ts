import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from './common.dto';

@InputType()
export class PaginationInput {
  @Field((type) => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CommonOutput {
  @Field((type) => Int, { nullable: true })
  totalResults?: number;

  @Field((type) => Int, { nullable: true })
  totalPages?: number;
}
