import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/common/common.module';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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
import { MsgRoom } from './entities/msg-room.entity';
import { Msg } from './entities/msg.entity';
import {
  RECEIVE_MSG,
  RECEIVE_MSG_COUNT,
  RECEIVE_MSG_ROOM,
} from './msg-constant';

@Injectable()
export class MsgServices {
  constructor(
    @InjectRepository(Msg) private readonly msgs: Repository<Msg>,
    @InjectRepository(MsgRoom) private readonly msgRooms: Repository<MsgRoom>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async createMsgRoom(
    user: User,
    { participants, productId }: CreateMsgRoomInput,
  ): Promise<CreateMsgRoomOutput> {
    try {
      const product = await this.products.findOne({ id: productId });
      if (!product) {
        return {
          ok: false,
          error: '해당 msgRoom에 연결 되야할 product가 존재하지 않습니다.',
        };
      }
      if (product.soldout === false) {
        return {
          ok: false,
          error: 'soldout되지 않은 product에선 msgRoom을 만들 수 없습니다.',
        };
      }
      if (participants.length <= 1) {
        return {
          ok: false,
          error: '2명 이상부터 MsgRoom 생성이 가능합니다.',
        };
      }
      await this.msgRooms.save(this.msgRooms.create({ participants, product }));
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'MsgRoom 생성에 실패했습니다.',
      };
    }
  }

  async allMsgRooms(user: User): Promise<AllMsgRoomsOutput> {
    try {
      let msgRooms: MsgRoom[] = [];
      if (user.msgRoomsId) {
        for (const msgRoomId of user.msgRoomsId) {
          const msgRoom = await this.msgRooms.findOneOrFail(
            { id: msgRoomId },
            { relations: ['participants', 'product'] },
          );
          if (msgRoom.deleted === false) {
            msgRooms.push(msgRoom);
          }
        }
      }

      return {
        ok: true,
        msgRooms,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'MsgRoom들을 불러오는데 실패했습니다.',
      };
    }
  }

  async deleteMsgRoom(
    user: User,
    { id: msgRoomId }: DeleteMsgRoomInput,
  ): Promise<DeleteMsgRoomOutput> {
    try {
      if (user.msgRoomsId.length === 0) {
        return {
          ok: false,
          error: '해당 유저는 msgRoom을 가지고 있지 않습니다.',
        };
      }
      const msgRoom = await this.msgRooms.findOne({ id: msgRoomId });
      if (!msgRoom) {
        return {
          ok: false,
          error: '해당 아이디를 가진 MsgRoom이 존재하지 않습니다.',
        };
      }
      const included = user.msgRoomsId.find((id) => id === msgRoomId);
      if (!included) {
        return {
          ok: false,
          error:
            '해당 유저는 입력 된 msgRoomId에 해당하는 msgRoom을 가지고 있지 않습니다.',
        };
      }
      await this.msgRooms.save([
        {
          id: msgRoomId,
          deleted: true,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'MsgRoom 삭제에 실패했습니다.',
      };
    }
  }

  async findMsgRoomById(
    user: User,
    { id: msgRoomId }: FindMsgRoomByIdInput,
  ): Promise<FindMsgRoomByIdOutput> {
    try {
      const msgRoom = await this.msgRooms.findOneOrFail(
        { id: msgRoomId },
        { relations: ['product', 'msgs', 'participants'] },
      );
      const included = user.msgRoomsId.find((id) => id === msgRoomId);
      if (!included) {
        return {
          ok: false,
          error: '해당 User는 해당 아이디의 msgRoom을 가지고 있지 않습니다.',
        };
      }
      if (msgRoom.deleted === true) {
        throw Error();
      }
      msgRoom.msgs.sort((a, b) => a.id - b.id);
      return { ok: true, msgRoom };
    } catch (error) {
      return {
        ok: false,
        error: '해당 아아디를 가진 msgRoom을 찾지 못했습니다.',
      };
    }
  }

  async msgCounts(msgRoom: MsgRoom): Promise<number> {
    try {
      const expandedMsgRoom = await this.msgRooms.findOne(
        { id: msgRoom.id },
        { relations: ['msgs'] },
      );
      if (!expandedMsgRoom) {
        return null;
      }
      return expandedMsgRoom.msgs.length;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // Msg
  async createMsg(
    user: User,
    { fromId, msgText, toId, msgRoomId }: CreateMsgInput,
  ): Promise<CreateMsgOutput> {
    try {
      if (user.id !== fromId) {
        return {
          ok: false,
          error: '현재 로그인한 유저와  Msg를 보내려는 유저의 정보가 다릅니다.',
        };
      }
      const toUser = await this.users.findOne({ id: toId });
      if (!toUser) {
        return {
          ok: false,
          error: '해당 Msg를 받을  User가 없습니다.',
        };
      }
      const msgRoom = await this.msgRooms.findOne(
        { id: msgRoomId },
        { relations: ['product', 'msgs', 'participants'] },
      );
      if (!msgRoom) {
        return {
          ok: false,
          error: '해당 MsgRoom이 존재하지 않습니다.',
        };
      }
      const AmIFromUser = msgRoom.participants.find(
        (eachUser) => eachUser.id === fromId,
      );
      const AmIToUser = msgRoom.participants.find(
        (eachUser) => eachUser.id === toId,
      );
      if (!Boolean(AmIFromUser) || !Boolean(AmIToUser)) {
        return {
          ok: false,
          error:
            'fromUser와 toUser 중에 MsgRoom에 존재하지 않은 유저가 있습니다.',
        };
      }
      const newMsg = await this.msgs.save(
        this.msgs.create({
          fromId,
          toId,
          msgRoom,
          msgText,
        }),
      );
      msgRoom.msgs.push(newMsg);
      msgRoom.msgs.sort((a, b) => a.id - b.id);
      // send some subscription payload
      await this.pubsub.publish(RECEIVE_MSG_ROOM, { receiveMsgRoom: msgRoom });
      await this.pubsub.publish(RECEIVE_MSG_COUNT, {
        receiveMsgCount: {
          id: msgRoom.id,
          msgCounts: msgRoom.msgs.length,
          createdAt: newMsg.createdAt,
        },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 Msg를 만들수 없습니다.',
      };
    }
  }

  async getUpdatedUser(user: User) {
    return this.users.findOne({ id: user.id });
  }
}
