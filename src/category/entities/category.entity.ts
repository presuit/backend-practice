import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@InputType('CategoryEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends Common {
  @Field((type) => String)
  @Column()
  name: string;

  @Field((type) => String)
  @Column()
  slug: string;

  @Field((type) => [Product], { nullable: true })
  @OneToMany((type) => Product, (product) => product.category, {
    nullable: true,
  })
  products?: Product[];
}
