import { Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import { Observable } from 'rxjs';
import { AssetDaily } from '@prisma/client';
import { AssetDaily as AssetDailySchema } from './asset-daily.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma/prisma.service';
// Injectable is a decorator to allow the class be inject in others
// that uses the Dependency Injection design pattern
@Injectable()
export class AssetsDailyService {
  constructor(
    private prismaService: PrismaService,
    // @InjectModel decorator injects the Mongoose model into your service class constructor
    @InjectModel(AssetDailySchema.name)
    private assetDailyModel: Model<AssetDailySchema>,
  ) {}

  // function to search all assetsDaily documents for the assetID os Symbol
  findAll(assetIdOrSymbol: string) {
    const where = ObjectId.isValid(assetIdOrSymbol)
      ? { asset_id: assetIdOrSymbol }
      : { asset: { symbol: assetIdOrSymbol } }; // Evaluation to decide if the input is a symbol os assetId

    return this.prismaService.assetDaily.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    }); // return the query on Mongo 
  }

  // function to watch mongo DB and get insert operations on Asset Daily Model (mongoose injection) for a specific asset id
  // This is an observable building block
  subscribeEvents(asset_id: string): Observable<{
    event: 'asset-daily-created';
    data: AssetDaily;
  }> {
    console.log(asset_id);
    return new Observable((observer) => {
      this.assetDailyModel
        .watch(
          [
            {
              $match: {
                operationType: 'insert',
                'fullDocument.asset_id': asset_id,
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          console.log(data);
          const asset = await this.prismaService.assetDaily.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({ event: 'asset-daily-created', data: asset }); 
        });
    });
  }
}
