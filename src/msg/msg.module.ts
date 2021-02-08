import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { MsgRoom } from './entities/msg-room.entity';
import { Msg } from './entities/msg.entity';
import { MsgResolvers, MsgRoomResolvers } from './msg.resolvers';
import { MsgServices } from './msg.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Msg, MsgRoom, User, Product]),
    UserModule,
  ],
  providers: [MsgRoomResolvers, MsgServices, MsgResolvers],
  exports: [MsgServices],
})
export class MsgModule {}
