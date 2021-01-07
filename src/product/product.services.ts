import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Product, DetailImg } from './entities/product.entity';
import { Room } from 'src/product/entities/room.entity';
import { CategoryRepository } from 'src/product/repositories/extended-category.entity';
import { FindProductByIdOutput } from './dtos/find-product-by-id.dto';
import { EditProductInput, EditProductOutput } from './dtos/edit-product.dto';
import { SoldoutInput, SoldoutOutput } from './dtos/soldout.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import {
  FindCategoryBySlugInput,
  FindCategoryBySlugOutput,
} from './dtos/find-category-by-slug.dto';
import { JoinRoomInput, JoinRoomOutput } from './dtos/join-room.dto';
import { isObjectBindingPattern } from 'typescript';
import { AllRoomsOutput } from './dtos/all-rooms.dto';

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

  async findProductById(productId: number): Promise<FindProductByIdOutput> {
    try {
      const product = await this.products.findOneOrFail({ id: productId });
      return {
        ok: true,
        product,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 아이디를 가진 프로덕트를 찾지 못했습니다.',
      };
    }
  }

  async editProduct(
    user: User,
    { productId, detailImgSrcs, categoryName, bigImg, name }: EditProductInput,
  ): Promise<EditProductOutput> {
    try {
      const product = await this.products.findOne(
        { id: productId },
        { relations: ['seller'] },
      );
      if (!product) {
        return {
          ok: false,
          error: '해당 아이디를 가진 프로덕트가 존재하지 않습니다.',
        };
      }
      if (product.soldout) {
        return {
          ok: false,
          error: '이미 solout 된 프로덕트를 업데이트 할 수 없습니다.',
        };
      }
      if (product.sellerId !== user.id) {
        return {
          ok: false,
          error: '해당 프로덕트를 수정할 권한이 없습니다.',
        };
      }
      if (detailImgSrcs) {
        const container: DetailImg[] = [];
        for (const item of detailImgSrcs) {
          const convertedItem = new DetailImg();
          convertedItem.source = item;
          container.push(convertedItem);
        }
        product.detailImgs = container;
      }
      if (categoryName) {
        const category = await this.categories.getOrCreateCategory(
          categoryName,
        );
        product.category = category;
      }

      await this.products.save([
        {
          id: productId,
          ...product,
          ...(name && { name }),
          ...(bigImg && { bigImg }),
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 프로덕트 수정에 실패했습니다.',
      };
    }
  }

  async soldout(
    owner: User,
    { buyerId, productId }: SoldoutInput,
  ): Promise<SoldoutOutput> {
    try {
      const buyer = await this.users.findOne({ id: buyerId });
      const product = await this.products.findOne({ id: productId });
      if (!buyer) {
        return {
          ok: false,
          error: '해당 아이디를 가진 구매자가 없습니다.',
        };
      }
      if (!product) {
        return {
          ok: false,
          error: '해당 아이디를 가진 product가 존재하지 않습니다.',
        };
      }

      if (buyer.id === owner.id) {
        return {
          ok: false,
          error: '구매자와 판매자가 동일할 수 없습니다.',
        };
      }
      await this.products.save([
        {
          id: productId,
          buyer,
          soldout: true,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'soldout 메소드가 정상적으로 작동하지 못했습니다.',
      };
    }
  }

  // Category Services
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find({
        relations: ['products'],
      });
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리들을 불러오는데 실패했습니다.',
      };
    }
  }

  async findCategoryBySlug({
    slug,
  }: FindCategoryBySlugInput): Promise<FindCategoryBySlugOutput> {
    try {
      const category = await this.categories.findOneOrFail(
        { slug },
        { relations: ['products'] },
      );
      return {
        ok: true,
        category,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 slug를 가진 category를 찾지 못했습니다.',
      };
    }
  }

  // Room Services

  async allRooms(): Promise<AllRoomsOutput> {
    try {
      const rooms = await this.rooms.find();
      if (!rooms) {
        return {
          ok: false,
          error: 'room이 존재하지 않습니다.',
        };
      }
      return {
        ok: true,
        rooms,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'room들을 불러오는데 실패하였습니다.',
      };
    }
  }

  async joinRoom(
    user: User,
    { productId, userId }: JoinRoomInput,
  ): Promise<JoinRoomOutput> {
    try {
      const participant = await this.users.findOne({ id: userId });
      const product = await this.products.findOne({ id: productId });
      const room = await this.rooms.findOne(
        { id: product.roomId },
        { relations: ['participants'] },
      );
      if (!participant) {
        return {
          ok: false,
          error: '입력된 아이디를 가진 유저가 존재하지 않습니다.',
        };
      }
      if (!product) {
        return {
          ok: false,
          error: '해당 아이디를 가진 product가 존재하지 않습니다.',
        };
      }
      if (!room) {
        return {
          ok: false,
          error: '해당 아이디를 가진 room이 존재하지 않습니다.',
        };
      }
      // 로그인한 유저의 아이디와 input으로 들어온 유저의 아이디가 다른경우
      if (user.id !== participant.id) {
        return {
          ok: false,
          error: '로그인한 유저와 입력된 유저가 다릅니다.',
        };
      }
      // 로그인한 유저의 아이디와 해당 product의 seller 아이디가 같은경우 => 판매자가 상품을 올려놓고 자기도 직접 추첨방에 들어가는 행동이므로 차단해야함.
      if (product.sellerId === user.id) {
        return {
          ok: false,
          error: '판매자는 room에 참여할 수 없습니다.',
        };
      }
      // 이미 room에 들어와 있는 경우라면 중복을 허용할 수 없으므로 차단해야함
      if (room.participants.find((user) => user.id === participant.id)) {
        return {
          ok: false,
          error: '이미 이 room에 참여하고 있습니다.',
        };
      }
      await this.rooms.save([
        {
          id: room.id,
          participants: [...room.participants, participant],
        },
      ]);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'user를 room에 포함시키지 못했습니다.',
      };
    }
  }
}
