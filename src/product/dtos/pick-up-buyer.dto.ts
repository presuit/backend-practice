import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from 'src/user/entities/user.entity';
import { Room } from '../entities/room.entity';

@InputType()
export class PickUpBuyerInput extends PickType(Room, ['id']) {
  @Field((type) => Int)
  productId: number;
}

@ObjectType()
export class PickUpBuyerOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  buyer?: User;
}
