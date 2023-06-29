import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletAssetsService } from './wallet-assets/wallet-assets.service';
import { WalletAssetsController } from './wallet-assets/wallet-assets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WalletAsset,
  WalletAssetSchema,
} from './wallet-assets/wallet-asset.schema';

// Wallet module, with Mongoose to inject Wallet Asset model 
@Module({
  imports: [
    MongooseModule.forFeature([ // just wallet asset scheme, because mongoose use that only schema to send SSE
      { name: WalletAsset.name, schema: WalletAssetSchema },
    ]),
  ],
  controllers: [WalletsController, WalletAssetsController],
  providers: [WalletsService, WalletAssetsService],
  exports: [WalletsService, WalletAssetsService],
})
export class WalletsModule {}
