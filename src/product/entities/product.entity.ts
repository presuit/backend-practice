import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { Room } from 'src/room/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Img } from './img-entity';

@InputType('ProductEntityInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Product extends Common {
  // 해당 중고품의 이름
  @Field((type) => String)
  @Column()
  name: string;

  //   셀러가 올린 중고품의 가격
  @Field((type) => Int)
  @Column()
  price: number;

  //   셀러가 올린 price에 대해 얼마나 모였는지 확인하는 가격변수
  @Field((type) => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  savedAmount: number;

  //   해당 상품이 사용자에게 보여질때 쓰일 대문 이미지에 대한 링크 주소 값
  @Field((type) => Img, { nullable: true })
  @OneToMany((type) => Img, (img) => img.product, { nullable: true })
  bigImg?: Img;

  //   상품 내부에 존재 하는 디테일한 상품 이미지에 대한 링크 주소 값들
  @Field((type) => [Img], { nullable: true })
  @OneToMany((type) => Img, (img) => img.product, { nullable: true })
  detailImgs?: Img[];

  //   이 상품을 판매하는 사람
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.sellingProducts)
  seller: User;

  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.buyingProducts, { nullable: true })
  buyer?: User;

  //   상품에 대한 카테고리
  @Field((type) => Category)
  @ManyToOne((type) => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field((type) => Room, { nullable: true })
  @OneToOne((type) => Room, (room) => room.product, { nullable: true })
  room?: Room;
}
