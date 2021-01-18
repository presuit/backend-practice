import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { MsgRoom } from 'src/msg/entities/msg-room.entity';
import { Room } from 'src/product/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToOne, RelationId } from 'typeorm';
import { Category } from './category.entity';

@InputType('DetailImgInput', { isAbstract: true })
@ObjectType()
export class DetailImg {
  @Field((type) => String)
  source: string;
}

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

  //  상품에 대한 설명
  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  //   셀러가 올린 price에 대해 얼마나 모였는지 확인하는 가격변수
  @Field((type) => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  savedAmount: number;

  //   해당 상품이 사용자에게 보여질때 쓰일 대문 이미지에 대한 링크 주소 값
  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  bigImg?: string;

  //   상품 내부에 존재 하는 디테일한 상품 이미지에 대한 링크 주소 값들
  @Field((type) => [DetailImg], { nullable: true })
  @Column({ type: 'json', nullable: true })
  detailImgs?: DetailImg[];

  //   이 상품을 판매하는 사람
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.sellingProducts, {
    onDelete: 'CASCADE',
  })
  seller: User;

  @RelationId((product: Product) => product.seller)
  sellerId: number;

  // 당첨돼서 이 상품을 구매할 사람
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.buyingProducts, { nullable: true })
  buyer?: User;

  @RelationId((product: Product) => product.buyer)
  buyerId: number;

  //   상품에 대한 카테고리
  @Field((type) => Category)
  @ManyToOne((type) => Category, (category) => category.products)
  category: Category;

  @RelationId((product: Product) => product.category)
  categoryId: number;

  // 상품이 만들어지면 참가자들을 참가시키고 보관하는 엔티티
  @Field((type) => Room, { nullable: true })
  @OneToOne((type) => Room, (room) => room.product, {
    nullable: true,
  })
  room?: Room;

  @RelationId((product: Product) => product.room)
  roomId: number;

  @Field((type) => MsgRoom, { nullable: true })
  @OneToOne((type) => MsgRoom, (msgRoom) => msgRoom.product, { nullable: true })
  msgRoom?: MsgRoom;

  @RelationId((product: Product) => product.msgRoom)
  msgRoomId: number;

  @Field((type) => Boolean, { defaultValue: false })
  @Column({ default: false })
  soldout: boolean;
}
