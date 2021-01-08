import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class MeOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  user?: User;
}
