import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class FindUserByIdInput {
  @Field((type) => Int)
  userId: number;
}

@ObjectType()
export class FindUserByIdOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  user?: User;
}
