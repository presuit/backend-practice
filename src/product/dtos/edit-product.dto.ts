import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Product } from '../entities/product.entity';
import { PointPercent } from '../entities/product.entity';

@InputType()
export class EditProductInput extends PartialType(
  PickType(Product, ['bigImg', 'name', 'description']),
) {
  @Field((type) => Number)
  productId: number;

  @Field((type) => [String], { nullable: true })
  detailImgSrcs?: string[];

  @Field((type) => String, { nullable: true })
  categorySlug?: string;

  @Field((type) => PointPercent, { nullable: true })
  pointPercent?: PointPercent;
}

@ObjectType()
export class EditProductOutput extends CommonOutput {}
