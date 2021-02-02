import { Inject } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
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
import { CreateMsgInput, CreateMsgOutput } from './dto/create-msg.dto';
import {
  DeleteMsgRoomInput,
  DeleteMsgRoomOutput,
} from './dto/delete-msg-room.dto';
import { FindMsgByIdInput, FindMsgByIdOutput } from './dto/find-msg-by-id.dto';
import {
  FindMsgRoomByIdInput,
  FindMsgRoomByIdOutput,
} from './dto/find-msg-room-by-id.dto';
import { MsgRoom } from './entities/msg-room.entity';
import { Msg } from './entities/msg.entity';
import { RECEIVE_MSG } from './msg-constant';
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

  @ResolveField((returns) => Int)
  msgCounts(@Parent() msgRoom: MsgRoom): Promise<number> {
    return this.msgServices.msgCounts(msgRoom);
  }

  // @Mutation((returns) => Boolean)
  // async potatoReady(@Args('id') id: number) {
  //   await this.pubsub.publish('hotPotatoes', {
  //     babyBocks: id,
  //   });
  //   return true;
  // }

  // @Subscription((returns) => String, {
  //   filter: ({ babyBocks }, { id }) => {
  //     console.log(babyBocks, id);
  //     return babyBocks === id;
  //   },
  //   resolve: ({ babyBocks }) => {
  //     return `Your Potato with the id ${babyBocks} is ready`;
  //   },
  // })
  // @Roles(['Any'])
  // babyBocks(@Args('id') id: number) {
  //   return this.pubsub.asyncIterator('hotPotatoes');
  // }
}

@Resolver((of) => Msg)
export class MsgResolvers {
  constructor(
    private readonly msgServices: MsgServices,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Roles(['Any'])
  @Mutation((returns) => CreateMsgOutput)
  createMsg(
    @AuthUser() user: User,
    @Args('input') input: CreateMsgInput,
  ): Promise<CreateMsgOutput> {
    return this.msgServices.createMsg(user, input);
  }

  @Roles(['Any'])
  @Subscription((returns) => Msg, {
    filter: (
      {
        receiveMsg: {
          msgRoom: { id: payloadMsgRoomId },
        },
      },
      { msgRoomId },
    ) => {
      return payloadMsgRoomId === msgRoomId;
    },
  })
  receiveMsg(@Args('msgRoomId') msgRoomId: number) {
    return this.pubsub.asyncIterator(RECEIVE_MSG);
  }

  @Roles(['Any'])
  @Query((returns) => FindMsgByIdOutput)
  findMsgById(
    @AuthUser() user: User,
    @Args('input') input: FindMsgByIdInput,
  ): Promise<FindMsgByIdOutput> {
    return this.msgServices.findMsgById(user, input);
  }
}
