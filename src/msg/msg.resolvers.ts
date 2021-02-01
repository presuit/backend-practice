import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { PUB_SUB } from 'src/common/common.module';
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
  constructor(
    private readonly msgServices: MsgServices,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

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

  @Mutation((returns) => Boolean)
  potatoReady() {
    this.pubsub.publish('hotPotatoes', { babyBocks: 'Your potato is ready!' });
    return true;
  }

  @Subscription((returns) => String)
  @Roles(['Any'])
  babyBocks(@AuthUser() user: User) {
    console.log(user);
    return this.pubsub.asyncIterator('hotPotatoes');
  }
}
