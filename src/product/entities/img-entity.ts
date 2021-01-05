import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@InputType('ImgEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Img extends Common {
  @Field((type) => String)
  @Column()
  source: string;

  @ManyToOne((type) => Product)
  @Field((type) => Product)
  product: Product;
}
