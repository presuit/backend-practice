import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Product } from '../entities/product.entity';

@ObjectType()
export class AllProductsOuput extends CommonOutput {
  @Field((type) => [Product], { nullable: true })
  products?: Product[];
}
