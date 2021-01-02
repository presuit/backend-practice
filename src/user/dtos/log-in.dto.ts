import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LogInInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LogInOutput extends CommonOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}
