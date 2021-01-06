import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Img } from '../entities/img-entity';
import { Product } from '../entities/product.entity';

@InputType()
export class CreateProductInput extends PickType(Product, ['name', 'price']) {
  @Field((type) => String, { nullable: true })
  bigImgSrc?: string;

  @Field((type) => [String], { nullable: true })
  detailImgSrcs?: string[];

  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateProductOutput extends CommonOutput {}
