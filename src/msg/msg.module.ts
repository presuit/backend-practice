import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { MsgRoom } from './entities/msg-room.entity';
import { Msg } from './entities/msg.entity';
import { MsgRoomResolvers } from './msg.resolvers';
import { MsgServices } from './msg.services';

@Module({
  imports: [TypeOrmModule.forFeature([Msg, MsgRoom, User, Product])],
  providers: [MsgRoomResolvers, MsgServices],
  exports: [MsgServices],
})
export class MsgModule {}
