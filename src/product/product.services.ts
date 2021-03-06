import { Inject, Injectable } from '@nestjs/common';
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
import { AllRoomsOutput } from './dtos/all-rooms.dto';
import { AllProductsInput, AllProductsOuput } from './dtos/all-products.dto';
import { MsgServices } from 'src/msg/msg.services';
import { Wallet, WalletHistory } from 'src/user/entities/wallet.entity';
import { PickUpBuyerInput, PickUpBuyerOutput } from './dtos/pick-up-buyer.dto';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/create-category.dto';
import { Category } from './entities/category.entity';
import { AuthUser } from 'src/common/auth-user';
import {
  DeleteProductInput,
  DeleteProductOutput,
} from './dtos/delete-product.dto';
import { AppServices } from 'src/app.services';
import { BUCKET_NAME } from '../app.services';

@Injectable()
export class ProductServices {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
    @Inject(MsgServices) private readonly msgServices: MsgServices,
    @Inject(AppServices) private readonly appServices: AppServices,
  ) {}

  async allProducts(
    user: User,
    { page }: AllProductsInput,
  ): Promise<AllProductsOuput> {
    try {
      let [products, totalResults] = await this.products.findAndCount({
        where: {
          soldout: false,
        },
        relations: ['category'],
        skip: (page - 1) * 8,
        take: 8,
        order: {
          id: 'DESC',
        },
      });
      if (!products) {
        return {
          ok: false,
          error: 'products가 존재하지 않습니다.',
        };
      }
      return {
        ok: true,
        products,
        totalResults,
        totalPages: Math.ceil(totalResults / 8),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'products가 존재하지 않습니다.',
      };
    }
  }

  async createProduct(
    user: User,
    {
      categorySlug,
      name,
      price,
      bigImg,
      detailImgs,
      description,
      pointPercent,
    }: CreateProductInput,
  ): Promise<CreateProductOutput> {
    try {
      const product = await this.products.save(
        this.products.create({
          name,
          price,
          seller: user,
          bigImg,
          description,
          pointPercent,
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

      const { ok, category, error } = await this.findCategoryBySlug({
        slug: categorySlug,
      });
      if (!ok && error) {
        return {
          ok,
          error,
        };
      }
      product.category = category;
      await this.products.save(product);
      return { ok: true, productId: product.id };
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
      const product = await this.products.findOneOrFail(
        { id: productId },
        { relations: ['category', 'room', 'seller', 'buyer'] },
      );
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
    {
      productId,
      detailImgSrcs,
      categorySlug,
      bigImg,
      name,
      description,
    }: EditProductInput,
  ): Promise<EditProductOutput> {
    try {
      const product = await this.products.findOne(
        { id: productId },
        { relations: ['seller'] },
      );
      let container: DetailImg[] = [];
      let category: Category;
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
      if (detailImgSrcs && detailImgSrcs.length !== 0) {
        for (const item of detailImgSrcs) {
          const convertedItem = new DetailImg();
          convertedItem.source = item;
          container.push(convertedItem);
        }
      }
      if (categorySlug) {
        const {
          ok,
          error,
          category: _category,
        } = await this.findCategoryBySlug({
          slug: categorySlug,
        });
        if (!ok && error) {
          return {
            ok,
            error,
          };
        }
        category = _category;
      }

      let _bigImg: string | null;
      if (bigImg) {
        if (bigImg === 'delete') {
          _bigImg = null;
        } else {
          _bigImg = bigImg;
        }
      }

      await this.products.save([
        {
          id: productId,
          ...(name && { name }),
          ...(bigImg && { bigImg: _bigImg }),
          ...(detailImgSrcs && container && { detailImgs: container }),
          ...(category && { category }),
          ...(description && { description }),
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
    user: User,
    { buyerId, productId }: SoldoutInput,
  ): Promise<SoldoutOutput> {
    try {
      const buyer = await this.users.findOne({ id: buyerId });
      const product = await this.products.findOne({ id: productId });
      const productRoom = await this.rooms.findOne(
        { id: product.roomId },
        { relations: ['participants'] },
      );
      const seller = await this.users.findOne({ id: product.sellerId });
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
      if (!productRoom) {
        return {
          ok: false,
          error: 'product에 해당하는 room이 존재하지 않습니다.',
        };
      }
      if (!seller) {
        return {
          ok: false,
          error: '해당 product에 seller가 존재하지 않습니다.',
        };
      }

      const participantValidate = productRoom.participants.find(
        (participant) => participant.id === buyerId,
      );
      if (!participantValidate) {
        return {
          ok: false,
          error: '해당 productRoom에 buyerId를 가진 user가 없습니다.',
        };
      }

      await this.products.save([
        {
          id: productId,
          buyer,
          soldout: true,
        },
      ]);

      const {
        ok: createMsgRoomOk,
        error: createMsgRoomError,
      } = await this.msgServices.createMsgRoom(user, {
        productId,
        participants: [seller, buyer],
      });

      if (!createMsgRoomOk && createMsgRoomError) {
        return {
          ok: createMsgRoomOk,
          error: createMsgRoomError,
        };
      }

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

  async pickUpBuyer({
    productId,
    id: roomId,
  }: PickUpBuyerInput): Promise<PickUpBuyerOutput> {
    try {
      const product = await this.products.findOne({ id: productId });
      const productRoom = await this.rooms.findOne(
        { id: roomId },
        { relations: ['participants'] },
      );
      const participants = productRoom.participants;
      if (!product) {
        return {
          ok: false,
          error: '해당 아이디를 가진 product가 존재하지 않습니다.',
        };
      }
      if (!productRoom) {
        return {
          ok: false,
          error: '해당 아이디를 가진 product room이 존재하지 않습니다.',
        };
      }
      if (product.roomId !== roomId) {
        return {
          ok: false,
          error: '입력된 product의 room과 입력된 room이 다릅니다.',
        };
      }
      // if (!participants || participants.length < 2) {
      //   return {
      //     ok: false,
      //     error:
      //       'product room에는 2명이상의 participant들이 존재해야 추첨이 가능합니다.',
      //   };
      // }
      if (product.savedAmount < product.price) {
        return {
          ok: false,
          error: '해당 product에 price만큼의 point가 모이지 않았습니다.',
        };
      }
      const index = Math.floor(Math.random() * participants.length);
      const buyer = participants[index];
      return {
        ok: true,
        buyer,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'buyer를 선택하지 못했습니다.',
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

  async createCategory({
    name,
  }: CreateCategoryInput): Promise<CreateCategoryOutput> {
    try {
      await this.categories.getOrCreateCategory(name);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
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
      category.products = category.products.filter(
        (each) => each.soldout === false,
      );
      category.products.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
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

  async allRooms(user: User): Promise<AllRoomsOutput> {
    try {
      const rooms: Room[] = [];
      for (const roomId of user.roomIds) {
        const room = await this.rooms.findOne({ id: roomId });
        if (!room) {
          return {
            ok: false,
            error: 'room들을 불러오는데 실패했습니다.',
          };
        }
        rooms.push(room);
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
    { productId, userId, price }: JoinRoomInput,
  ): Promise<JoinRoomOutput> {
    try {
      const participant = await this.users.findOne({ id: userId });
      const product = await this.products.findOne({ id: productId });
      const room = await this.rooms.findOne(
        { id: product.roomId },
        { relations: ['participants'] },
      );
      const wallet = await this.wallets.findOne({ id: user.walletId });
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
      if (!wallet) {
        return {
          ok: false,
          error: '해당 유저의 wallet을 찾지 못했습니다.',
        };
      }
      if (product.soldout === true) {
        return {
          ok: false,
          error: '이미 판매된 product의 room에 입장할 수 없습니다',
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
      if (wallet.point < price) {
        return {
          ok: false,
          error:
            '해당 유저의 wallet에는 price를 처리할 만큼의 point가 없습니다.',
        };
      }
      let histories: WalletHistory[];
      const newWalletHistory: WalletHistory = {
        canIRefund: false,
        purchaseDate: Date.now(),
        productId: product.id,
        price,
      };
      if (wallet.histories) {
        histories = [...wallet.histories, newWalletHistory];
      } else {
        histories = [newWalletHistory];
      }
      await this.wallets.save([
        {
          id: wallet.id,
          point: wallet.point - price,
          histories,
        },
      ]);
      const savedAmount = product.savedAmount + price;
      await this.products.save([
        {
          id: product.id,
          savedAmount,
        },
      ]);
      await this.rooms.save([
        {
          id: room.id,
          participants: [...room.participants, participant],
        },
      ]);
      if (savedAmount >= product.price) {
        // 일단 모금액이 충분히 모이면 buyer를 뽑아내는 메소드 작동(pickUpBuyer)
        const {
          ok: pickUpBuyerOk,
          error: pickUpBuyerError,
          buyer,
        } = await this.pickUpBuyer({
          id: product.roomId,
          productId: product.id,
        });
        if (!pickUpBuyerOk && pickUpBuyerError) {
          return {
            ok: pickUpBuyerOk,
            error: pickUpBuyerError,
          };
        }
        // 에러없이 buyer가 리턴 되었으면 buyer로 soldout 메소드 실행
        if (buyer) {
          const { ok: soldOutOk, error: soldOutError } = await this.soldout(
            user,
            {
              buyerId: buyer.id,
              productId: product.id,
            },
          );
          if (!soldOutOk && soldOutError) {
            return {
              ok: soldOutOk,
              error: soldOutError,
            };
          }
          // 에러없이 완벽하게 동작하면 joinRoom에서는 리턴으로 ok 말고 soldout 됬는지 안됬는지를 판별해주는 boolean값 리턴
          return { ok: true, soldout: true };
        }
      }
      // 아직 모금액에 도달하지 못했다면 soldout은 false
      return { ok: true, soldout: false };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'user를 room에 포함시키지 못했습니다.',
      };
    }
  }

  participantCounts(room: Room): number {
    return room.participants.length;
  }

  isMeInRoom(room: Room, userId: number): boolean {
    return Boolean(
      room.participants.find((participant) => participant.id === userId),
    );
  }

  async deleteProduct(
    user: User,
    { productId }: DeleteProductInput,
  ): Promise<DeleteProductOutput> {
    try {
      const product = await this.products.findOneOrFail(productId);
      const validate = user.sellingProductsIds.find(
        (each) => each === product.id,
      );
      if (!Boolean(validate)) {
        return {
          ok: false,
          error: '당신은 이 product를 지울 권한이 없습니다.',
        };
      }
      // aws s3에 저장된 product detailImgs 지워주는 로직
      for (const each of product.detailImgs) {
        const key = each.source.split('/')[3];
        const { deleted, error } = await this.appServices.deleteImg({
          bucket: BUCKET_NAME,
          key,
        });
        if (!deleted) {
          console.log(error);
          throw Error(error);
        }
      }
      await this.products.delete(productId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '해당 product를 지울 수 없습니다.',
      };
    }
  }
}
