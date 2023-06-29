import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './asset.schema';
import { AssetDaily, AssetDailySchema } from './asset-daily.schema';
import { AssetsDailyController } from './assets-daily.controller';
import { AssetsDailyService } from './assets-daily.service';

// Assets Module import schemas asset and assetdaily with mongoose
// Assets and AssetsDaily Controllers
// Export AssetsService to other modules
@Module({
  imports: [
    MongooseModule.forFeature([ //mongoosemodule.forfeature is used to registring the schema in that module
      { name: Asset.name, schema: AssetSchema },
      { name: AssetDaily.name, schema: AssetDailySchema },
    ]),
  ],
  controllers: [AssetsController, AssetsDailyController],
  providers: [AssetsService, AssetsDailyService],
  exports: [AssetsService],
})
export class AssetsModule {}

// Module file essentially bundles all the controllers and providers of your application together