import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['username', 'password']),
) {
  @Field((type) => Int)
  userId: number;
}

@ObjectType()
export class EditProfileOutput extends CommonOutput {}
