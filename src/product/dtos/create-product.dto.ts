import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Product } from '../entities/product.entity';

@InputType()
export class CreateProductInput extends PickType(Product, ['name', 'price']) {
  @Field((type) => String, { nullable: true })
  bigImg?: string;

  @Field((type) => [String], { nullable: true })
  detailImgs?: string[];

  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateProductOutput extends CommonOutput {}
