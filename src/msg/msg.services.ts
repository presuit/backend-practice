import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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
import { Msg } from './entities/msg.entity';

@Injectable()
export class MsgServices {
  constructor(
    @InjectRepository(Msg) private readonly msgs: Repository<Msg>,
    @InjectRepository(MsgRoom) private readonly msgRooms: Repository<MsgRoom>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async createMsgRoom({
    participants,
    productId,
  }: CreateMsgRoomInput): Promise<CreateMsgRoomOutput> {
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
            { relations: ['participants'] },
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
      const msgRoom = await this.msgRooms.findOneOrFail({ id: msgRoomId });
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
      return { ok: true, msgRoom };
    } catch (error) {
      return {
        ok: false,
        error: '해당 아아디를 가진 msgRoom을 찾지 못했습니다.',
      };
    }
  }
}
