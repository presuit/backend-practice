import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/product/repositories/extended-category.entity';
import { Room } from 'src/room/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { Product } from './entities/product.entity';
import { ProductResolvers } from './product.resolvers';
import { ProductServices } from './product.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, CategoryRepository, Room]),
  ],
  providers: [ProductResolvers, ProductServices],
})
export class ProductModule {}
