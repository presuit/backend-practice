import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Product, DetailImg } from './entities/product.entity';
import { Room } from 'src/room/entities/room.entity';
import { CategoryRepository } from 'src/product/repositories/extended-category.entity';

@Injectable()
export class ProductServices {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
  ) {}

  async createProduct(
    user: User,
    { categoryName, name, price, bigImg, detailImgs }: CreateProductInput,
  ): Promise<CreateProductOutput> {
    try {
      const product = await this.products.save(
        this.products.create({
          name,
          price,
          seller: user,
          bigImg,
        }),
      );

      if (detailImgs && detailImgs.length !== 0) {
        const detailImgContainer: DetailImg[] = [];
        for (const item of detailImgs) {
          const detailImg = new DetailImg();
          detailImg.source = item;
          detailImgContainer.push(detailImg);
        }
        product.detailImgs = detailImgContainer;
      }

      const room = await this.rooms.save(this.rooms.create({ product }));
      product.room = room;

      const category = await this.categories.getOrCreateCategory(categoryName);
      product.category = category;

      console.log(product);
      await this.products.save(product);
      return { ok: true };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '프로덕트 만들기 실패',
      };
    }
  }
}
