import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { User } from 'src/user/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { AllProductsInput, AllProductsOuput } from './dtos/all-products.dto';
import { AllRoomsOutput } from './dtos/all-rooms.dto';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { EditProductInput, EditProductOutput } from './dtos/edit-product.dto';
import {
  FindCategoryBySlugInput,
  FindCategoryBySlugOutput,
} from './dtos/find-category-by-slug.dto';
import { FindProductByIdOutput } from './dtos/find-product-by-id.dto';
import { JoinRoomInput, JoinRoomOutput } from './dtos/join-room.dto';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Room } from './entities/room.entity';
import { ProductServices } from './product.services';

@Resolver((of) => Product)
export class ProductResolvers {
  constructor(private readonly productServices: ProductServices) {}

  @Roles(['Any'])
  @Query((returns) => AllProductsOuput)
  allProducts(
    @AuthUser() user: User,
    @Args('input') input: AllProductsInput,
  ): Promise<AllProductsOuput> {
    return this.productServices.allProducts(user, input);
  }

  @Roles(['Any'])
  @Mutation((returns) => CreateProductOutput)
  createProduct(
    @AuthUser() user: User,
    @Args('input') input: CreateProductInput,
  ): Promise<CreateProductOutput> {
    return this.productServices.createProduct(user, input);
  }

  @Roles(['Any'])
  @Query((returns) => FindProductByIdOutput)
  findProductById(
    @Args('productId') productId: number,
  ): Promise<FindProductByIdOutput> {
    return this.productServices.findProductById(productId);
  }

  @Roles(['Any'])
  @Mutation((returns) => EditProductOutput)
  editProduct(
    @AuthUser() user: User,
    @Args('input') input: EditProductInput,
  ): Promise<EditProductOutput> {
    return this.productServices.editProduct(user, input);
  }
}

@Resolver((of) => Room)
export class RoomResolvers {
  constructor(private readonly productServices: ProductServices) {}

  @Roles(['Any'])
  @Query((returns) => AllRoomsOutput)
  allRooms(@AuthUser() user: User): Promise<AllRoomsOutput> {
    return this.productServices.allRooms(user);
  }

  @Roles(['Any'])
  @Mutation((returns) => JoinRoomOutput)
  joinRoom(
    @AuthUser() user: User,
    @Args('input') input: JoinRoomInput,
  ): Promise<JoinRoomOutput> {
    return this.productServices.joinRoom(user, input);
  }
}

@Resolver((of) => Category)
export class CategoryResolvers {
  constructor(private readonly productServices: ProductServices) {}

  @Roles(['Any'])
  @Query((returns) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.productServices.allCategories();
  }

  @Roles(['Any'])
  @Query((returns) => FindCategoryBySlugOutput)
  findCategoryBySlug(
    @Args('input') input: FindCategoryBySlugInput,
  ): Promise<FindCategoryBySlugOutput> {
    return this.productServices.findCategoryBySlug(input);
  }
}
