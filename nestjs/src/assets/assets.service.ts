import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { Observable } from 'rxjs';
import { Asset } from '@prisma/client';
import { Asset as AssetSchema } from './asset.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Injectable is a decorator to allow the class be inject in others
// that uses the Dependency Injection design pattern
@Injectable()
export class AssetsService {
  constructor(
    private prismaService: PrismaService,
    // @InjectModel decorator injects the Mongoose model into your service class constructor
    @InjectModel(AssetSchema.name) private assetModel: Model<AssetSchema>,
  ) {}

  // function to return all assets in database
  all() {
    return this.prismaService.asset.findMany();
  }

  // function to create a new document in database
  create(data: { id: string; symbol: string; price: number }) {
    return this.prismaService.asset.create({
      data,
    });
  }

  // function to return an asset by Id
  findOne(id: string) {
    return this.prismaService.asset.findUnique({
      where: {
        id,
      },
    });
  }

  // function to watch mongo DB and get update operations on Asset Model (mongoose injection)
  // We need test if just catch change on price, I think isn't that
  // This is an observable building block
  subscribeEvents(): Observable<{ event: 'asset-price-changed'; data: Asset }> {
    return new Observable((observer) => {
      this.assetModel
        .watch(
          [
            {
              $match: {
                operationType: 'update',
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => { // When a chance is catch get the asset
          console.log(data);
          const asset = await this.prismaService.asset.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({ event: 'asset-price-changed', data: asset }); // sent the event 'asset-price-changed' and the asset
        });
    });
  }
}

// The main building blocks of RxJS are
// Observable - an object responsible for handling data stream and notifying abservers when new data arrives
// Observer - Consumers od data streams emitted by observables. Usually, it's a simple handler function that runs each time a new event occurs