import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitTransactionDto, InputExecuteTransactionDto } from './order.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Observable, map } from 'rxjs';

type ExecuteTransactionMessage = {
  order_id: string;
  investor_id: string;
  asset_id: string;
  order_type: string;
  status: 'OPEN' | 'CLOSED';
  partial: number;
  shares: number;
  transactions: {
    transaction_id: string;
    buyer_id: string;
    seller_id: string;
    asset_id: string;
    shares: number;
    price: number;
  }[];
};

// Controller decorator and api url localhost:300/prefix -> prefix 'wallets/:wallets_id/orders'
@Controller('wallets/:wallet_id/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Get decorator to specify behaviour of a get call, use the wallet_id param and run all method from orders.service.ts
  @Get()
  all(@Param('wallet_id') wallet_id: string) {
    return this.ordersService.all({ wallet_id });
  }

  // Post decorator to specify behaviour of a post call
  @Post()
  initTransactionDto( 
    @Param('wallet_id') wallet_id: string, // use wallet_id param
    @Body() body: Omit<InitTransactionDto, 'wallet_id'>, // transform the body on the initTransactionDto object Omit<T,Keys> contructs a type by picking all properties from T and then removing Keys
  ) {
    return this.ordersService.initTransaction({ // call initTransaction method with the body and wallet id
      ...body,
      wallet_id,
    });
  }

  // Post decorator to specify behaviour of a post call on /wallets/:wallet_id/orders/execute
  @Post('execute')
  executeTransactionRest(
    @Param('wallet_id') wallet_id: string,
    @Body() body: InputExecuteTransactionDto, // transform the body on a InputExecuteTransation DTO - Data Transfer Object
  ) {
    return this.ordersService.executeTransaction(body); // call executeTransaction with body
  }

  // Message pattern decorator for synchronous message style
  // EventPattern decorator for asynchronous messages style
  @MessagePattern('output') // here we are reading the topic output on Kafka
  async executeTransactionConsumer(
    @Payload() message: ExecuteTransactionMessage, // transform payload on an execute transaction message (from the begin of the code)
  ) {
    const transaction = message.transactions[message.transactions.length - 1]; // get the last transaction on the message
    await this.ordersService.executeTransaction({
      order_id: message.order_id,
      status: message.status,
      related_investor_id:
        message.order_type === 'BUY'
          ? transaction.seller_id
          : transaction.buyer_id,
      broker_transaction_id: transaction.transaction_id,
      negotiated_shares: transaction.shares,
      price: transaction.price,
    }); // execute transaction method from orders.service.ts
  }

  // Decorator to create a server sent event with a path 'events'
  @Sse('events')
  // return an Observable after operations applied on pipe
  events(@Param('wallet_id') wallet_id: string): Observable<MessageEvent> {
    // call ordersService subscribeEvents on orders.service.ts with the id param
    return this.ordersService.subscribeEvents(wallet_id).pipe( // pipe is an instance method  and apply a map operator
      map((event) => ({ // Operator takes in the values from one Observable, and creates a new observable that emits altered values of the original Observable's value, without affecting the original Observable
        type: event.event,
        data: event.data,
      })),
    );
  }
}
