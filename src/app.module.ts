import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { User } from './user/entities/user.entity';
import { Verification } from './user/entities/verification.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './jwt/jwt.module';
import { ProductModule } from './product/product.module';
import { Product } from './product/entities/product.entity';
import { Category } from './product/entities/category.entity';
import { Room } from './product/entities/room.entity';
import { MsgModule } from './msg/msg.module';
import { Msg } from './msg/entities/msg.entity';
import { MsgRoom } from './msg/entities/msg-room.entity';
import { Wallet } from './user/entities/wallet.entity';
import { AppControllers } from './app.controllers';
import { AppServices } from './app.services';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' && [
        '.development.env',
      ],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      introspection: true,
      playground: true,
      debug: false,
      installSubscriptionHandlers: true,
      context: (context) => {
        if (context.req) {
          return {
            // for HTTP protocol
            token: context.req.headers['x-jwt'],
            req: context.req,
          };
        }
        if (context.connection) {
          // for subscription WS
          return {
            token: context.connection.context['x-jwt'],
          };
        }
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      ...(process.env.NODE_ENV === 'production'
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.PG_HOST,
            port: +process.env.PG_PORT,
            username: process.env.PG_USERNAME,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
          }),
      entities: [
        User,
        Verification,
        Product,
        Category,
        Room,
        Msg,
        MsgRoom,
        Wallet,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
    JwtModule.forRoot({ secret: process.env.JWT_SECRET }),
    CommonModule,
    UserModule,
    ProductModule,
    MsgModule,
    EmailModule.forRoot(
      {
        email: process.env.NODEMAILER_EMAIL,
        password: process.env.NODEMAILER_PASS,
      },
      {
        port: +process.env.SMTP_PORT,
        host: process.env.SMTP_HOST,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS,
        },
      },
    ),
  ],
  controllers: [AppControllers],
  providers: [AppServices],
})
export class AppModule {}
