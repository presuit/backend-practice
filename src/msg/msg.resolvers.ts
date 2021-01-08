import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { User } from 'src/user/entities/user.entity';
import { AllMsgRoomsOutput } from './dto/all-msg-rooms.dto';
import {
  CreateMsgRoomInput,
  CreateMsgRoomOutput,
} from './dto/create-msg-room.dto';
import {
  DeleteMsgRoomInput,
  DeleteMsgRoomOutput,
} from './dto/delete-msg-room.dto';
import {
  FindMsgRoomByIdInput,
  FindMsgRoomByIdOutput,
} from './dto/find-msg-room-by-id.dto';
import { MsgRoom } from './entities/msg-room.entity';
import { MsgServices } from './msg.services';

@Resolver((of) => MsgRoom)
export class MsgRoomResolvers {
  constructor(private readonly msgServices: MsgServices) {}

  @Roles(['Any'])
  @Mutation((returns) => CreateMsgRoomOutput)
  createMsgRoom(
    @Args('input') input: CreateMsgRoomInput,
  ): Promise<CreateMsgRoomOutput> {
    return this.msgServices.createMsgRoom(input);
  }

  @Roles(['Any'])
  @Query((returns) => AllMsgRoomsOutput)
  allMsgRooms(@AuthUser() user: User): Promise<AllMsgRoomsOutput> {
    return this.msgServices.allMsgRooms(user);
  }

  @Roles(['Any'])
  @Query((returns) => FindMsgRoomByIdOutput)
  findMsgRoomById(
    @AuthUser() user: User,
    @Args('input') input: FindMsgRoomByIdInput,
  ): Promise<FindMsgRoomByIdOutput> {
    return this.msgServices.findMsgRoomById(user, input);
  }

  @Roles(['Any'])
  @Mutation((returns) => DeleteMsgRoomOutput)
  deleteMsgRoom(
    @Args('input') input: DeleteMsgRoomInput,
    @AuthUser() user: User,
  ): Promise<DeleteMsgRoomOutput> {
    return this.msgServices.deleteMsgRoom(user, input);
  }
}
