import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { getCustomRepository, Repository } from 'typeorm';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Category } from '../category/entities/category.entity';
import { Product } from './entities/product.entity';
import { Img } from './entities/img-entity';
import { Room } from 'src/room/entities/room.entity';
import { CategoryRepository } from 'src/category/entities/extended-category.entity';

@Injectable()
export class ProductServices {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CategoryRepository)
    private readonly categories: Repository<CategoryRepository>,
    @InjectRepository(Img) private readonly imgs: Repository<Img>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
  ) {}

  async createProduct(
    user: User,
    { categoryName, name, price, bigImgSrc, detailImgSrcs }: CreateProductInput,
  ): Promise<CreateProductOutput> {
    try {
      const product = await this.products.save(
        this.products.create({
          name,
          price,
          seller: user,
        }),
      );

      const room = await this.rooms.save(this.rooms.create({ product }));
      product.room = room;

      if (bigImgSrc) {
        const bigImg = await this.imgs.save(
          this.imgs.create({ source: bigImgSrc, product }),
        );
        product.bigImg = bigImg;
      }

      if (detailImgSrcs && detailImgSrcs.length !== 0) {
        const detailImgs: Img[] = [];
        for (const eachDetailImgSrc of detailImgSrcs) {
          const detailImg = await this.imgs.save(
            this.imgs.create({
              source: eachDetailImgSrc,
              product,
            }),
          );
          detailImgs.push(detailImg);
        }
        product.detailImgs = detailImgs;
      }
      //   category 만들어서 추가하는 로직 필요함

      await this.products.save(product);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '프로덕트 만들기 실패',
      };
    }
  }
}
