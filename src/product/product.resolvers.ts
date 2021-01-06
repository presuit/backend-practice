import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/common/auth-roles';
import { AuthUser } from 'src/common/auth-user';
import { User } from 'src/user/entities/user.entity';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductServices } from './product.services';

@Resolver((of) => Product)
export class ProductResolvers {
  constructor(private readonly productServices: ProductServices) {}

  @Roles(['Any'])
  @Mutation((returns) => CreateProductOutput)
  createProduct(
    @AuthUser() user: User,
    @Args('input') input: CreateProductInput,
  ): Promise<CreateProductOutput> {
    return this.productServices.createProduct(user, input);
  }
}
