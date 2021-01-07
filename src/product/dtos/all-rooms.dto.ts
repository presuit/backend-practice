import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Room } from '../entities/room.entity';

@ObjectType()
export class AllRoomsOutput extends CommonOutput {
  @Field((type) => [Room], { nullable: true })
  rooms?: Room[];
}
