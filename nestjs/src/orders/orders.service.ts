import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { InitTransactionDto, InputExecuteTransactionDto } from './order.dto';
import { Order, OrderStatus, OrderType } from '@prisma/client';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Order as OrderSchema } from './order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable() // decorator to allow inject the class
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    @Inject('ORDERS_PUBLISHER') // inject the kafka register on module
    private readonly kafkaClient: ClientKafka,
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderSchema>, // Inject mogoose model
  ) {}

  // function to get all transactions and asset from an wallet, desc order
  all(filter: { wallet_id: string }) {
    return this.prismaService.order.findMany({
      where: {
        wallet_id: filter.wallet_id,
      },
      include: {
        Transactions: true,
        Asset: {
          select: {
            id: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  // method to init a transaction, async keyword is used to method can run asynchronous when use await keyword
  // async allows us to write promises-based code
  async initTransaction(input: InitTransactionDto) {
    //prismaService.$use()

    // wait is used to wait for the promise
    const order = await this.prismaService.order.create({ // use await keyword to run the prismaService create on order model
      data: {
        asset_id: input.asset_id,
        wallet_id: input.wallet_id,
        shares: input.shares,
        partial: input.shares,
        price: input.price,
        type: input.type,
        status: OrderStatus.PENDING,
        version: 1,
      },
    });
    // publish on the kafka in 'input' topic the order
    this.kafkaClient.emit('input', {
      order_id: order.id,
      investor_id: order.wallet_id,
      asset_id: order.asset_id,
      //current_shares: order.shares,
      shares: order.shares,
      price: order.price,
      order_type: order.type,
    });
    return order; // return the order
  }

  async executeTransaction(input: InputExecuteTransactionDto) {
    //transacao e travamento
    return this.prismaService.$transaction(async (prisma) => { // do all updates when called
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: input.order_id },
      }); // find the order on order model

      await prisma.order.update({
        where: { id: input.order_id, version: order.version },
        data: {
          partial: order.partial - input.negotiated_shares, // update order partial with negatiated_shares
          status: input.status, // update order status
          Transactions: {
            create: {
              broker_transaction_id: input.broker_transaction_id,
              related_investor_id: input.related_investor_id,
              shares: input.negotiated_shares,
              price: input.price,
            },
          }, // add a transaction to the order
          version: { increment: 1 }, // increment the version
        },
      });
      if (input.status === OrderStatus.CLOSED) { // if the order already closed (transaction could be partial)
        await prisma.asset.update({
          where: { id: order.asset_id },
          data: {
            price: input.price,
          },
        }); // update the asset price
        await this.prismaService.assetDaily.create({
          data: {
            asset_id: order.asset_id,
            date: new Date(),
            price: input.price,
          },
        }); // update the asset daiy price
        const walletAsset = await prisma.walletAsset.findUnique({ // find the wallet asset on the wallet
          where: {
            wallet_id_asset_id: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
            },
          },
        });
        // if asset already in wallet update asset quantity
        if (walletAsset) {
          console.log(walletAsset);
          //se já tiver o ativo na carteira, atualiza a quantidade de ativos
          await prisma.walletAsset.update({
            where: {
              wallet_id_asset_id: {
                asset_id: order.asset_id,
                wallet_id: order.wallet_id,
              },
              version: walletAsset.version,
            },
            data: {
              shares:
                order.type === OrderType.BUY
                  ? walletAsset.shares + order.shares
                  : walletAsset.shares - order.shares, // if a buy order sum, else decrease
              version: { increment: 1 },
            },
          });
        } else {
          //só poderia adicionar na carteira se a ordem for de compra
          // if the asset don't exist on the wallet create -> here we create buy and sell orders
          await prisma.walletAsset.create({
            data: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
              shares: input.negotiated_shares,
              version: 1,
            },
          });
        }
      }
    });
    //-------------adicionar a transacao em order
    //-----contabilizar a quantidade de ativos na carteira
    //----atualizar o status da ordem OPEN ou CLOSED
    //----atualizar o preco do ativo
  }

  // method to create an observable to sent server events on order-created and order-updated
  subscribeEvents(
    wallet_id: string,
  ): Observable<{ event: 'order-created' | 'order-updated'; data: Order }> {
    return new Observable((observer) => {
      this.orderModel
        .watch(
          [
            {
              $match: {
                $or: [{ operationType: 'insert' }, { operationType: 'update' }], // match operation types
                'fullDocument.wallet_id': wallet_id,
              },
            },
          ],
          { fullDocument: 'updateLookup' },
        )
        .on('change', async (data) => {
          const order = await this.prismaService.order.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({
            event:
              data.operationType === 'insert'
                ? 'order-created'
                : 'order-updated',
            data: order,
          }); // sent the event
        });
    });
  }
}
