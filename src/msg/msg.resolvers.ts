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
import { UserResolvers } from 'src/user/user.resolvers';
import { UserServices } from 'src/user/user.services';
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
import {
  FindMsgRoomByIdInput,
  FindMsgRoomByIdOutput,
} from './dto/find-msg-room-by-id.dto';
import { ReceiveMsgCountOutput } from './dto/receive-msg-counts.dto';
import { MsgRoom } from './entities/msg-room.entity';
import { Msg } from './entities/msg.entity';
import { RECEIVE_MSG_COUNT, RECEIVE_MSG_ROOM } from './msg-constant';
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
    @AuthUser() user: User,
    @Args('input') input: CreateMsgRoomInput,
  ): Promise<CreateMsgRoomOutput> {
    return this.msgServices.createMsgRoom(user, input);
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

  @Roles(['Any'])
  @Subscription((returns) => MsgRoom, {
    filter: ({ receiveMsgRoom }, { msgRoomId }, { user }) => {
      const validateUser = user.msgRoomsId.find(
        (eachMsgRoomId) => eachMsgRoomId === msgRoomId,
      );
      if (!Boolean(validateUser)) {
        return false;
      }
      return receiveMsgRoom.id === msgRoomId;
    },
  })
  receiveMsgRoom(@Args('msgRoomId') msgRoomId: number) {
    return this.pubsub.asyncIterator(RECEIVE_MSG_ROOM);
  }

  @Roles(['Any'])
  @Subscription((returns) => ReceiveMsgCountOutput, {
    async filter(this: MsgRoomResolvers, { receiveMsgCount }, _, { user }) {
      const _user = await this.msgServices.getUpdatedUser(user);
      const validate = _user.msgRoomsId.find(
        (eachMsgRoomId) => eachMsgRoomId === receiveMsgCount.id,
      );
      if (!Boolean(validate)) {
        return false;
      }
      return true;
    },
  })
  async receiveMsgCount(@AuthUser() user: User) {
    return this.pubsub.asyncIterator(RECEIVE_MSG_COUNT);
  }
}

@Resolver((of) => Msg)
export class MsgResolvers {
  constructor(private readonly msgServices: MsgServices) {}

  @Roles(['Any'])
  @Mutation((returns) => CreateMsgOutput)
  createMsg(
    @AuthUser() user: User,
    @Args('input') input: CreateMsgInput,
  ): Promise<CreateMsgOutput> {
    return this.msgServices.createMsg(user, input);
  }
}
