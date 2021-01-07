import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Product } from '../entities/product.entity';

@ObjectType()
export class FindProductByIdOutput extends CommonOutput {
  @Field((type) => Product, { nullable: true })
  product?: Product;
}
