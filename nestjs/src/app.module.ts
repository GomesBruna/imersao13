import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';
import { OrdersModule } from './orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SimulateAssetsPriceCommand } from './simulate-assets-price.command';
// Main Module, import all modules (Asset, Prisma, Wallet,Order) and init Mongoose
@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AssetsModule,
    WalletsModule,
    OrdersModule,
    MongooseModule.forRoot(process.env.DATABASE_URL), // connecting to mongoSb with mongoose
  ],
  controllers: [AppController],
  providers: [AppService, SimulateAssetsPriceCommand], //The main idea of a provider is that it can be injected as a dependency
})
export class AppModule {}
