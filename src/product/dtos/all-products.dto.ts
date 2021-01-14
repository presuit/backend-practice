import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Product } from '../entities/product.entity';

@InputType()
export class AllProductsInput extends PaginationInput {}

@ObjectType()
export class AllProductsOuput extends PaginationOutput {
  @Field((type) => [Product], { nullable: true })
  products?: Product[];
}
