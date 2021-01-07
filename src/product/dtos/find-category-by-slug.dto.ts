import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class FindCategoryBySlugInput extends PickType(Category, ['slug']) {}

@ObjectType()
export class FindCategoryBySlugOutput extends CommonOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}
