import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { User } from './user/entities/user.entity';
import { Verification } from './user/entities/verification.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './jwt/jwt.module';
import { SmsModule } from './sms/sms.module';
import { ProductModule } from './product/product.module';
import { Product } from './product/entities/product.entity';
import { Category } from './product/entities/category.entity';
import { Room } from './product/entities/room.entity';
import { MsgModule } from './msg/msg.module';
import { Msg } from './msg/entities/msg.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.development.env'],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: true,
      debug: false,
      context: (context) => {
        if (context.req) {
          return {
            token: context.req.headers['x-jwt'],
          };
        }
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: [User, Verification, Product, Category, Room, Msg],
      synchronize: true,
      logging: true,
    }),
    JwtModule.forRoot({ secret: process.env.JWT_SECRET }),
    CommonModule,
    UserModule,
    SmsModule.forRoot({
      apiKey: process.env.SOLAPI_API_KEY,
      apiSecret: process.env.SOLAPI_SECRET_KEY,
    }),
    ProductModule,
    MsgModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
