import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { WalletAssetsService } from './wallet-assets.service';
import { Observable, map } from 'rxjs';


// /wallets/
// Controller decorator and api url localhost:300/prefix -> prefix 'wallets/:wallet_id/assets
@Controller('wallets/:wallet_id/assets')
export class WalletAssetsController {
  constructor(private walletAssetsService: WalletAssetsService) {}

  // Get decorator to specify behaviour of a get call, using the wallet_id param and call all() method from wallet-assets.service.ts
  @Get()
  all(@Param('wallet_id') wallet_id: string) {
    return this.walletAssetsService.all({ wallet_id });
  }

  // Post decorator to specify behaviour of a post call, using the wallet_id param and call create() method from wallet-assets.service.ts
  // body needed asset_id and shares
  @Post()
  create(
    @Param('wallet_id') wallet_id: string,
    @Body() body: { asset_id: string; shares: number },
  ) {
    return this.walletAssetsService.create({
      wallet_id,
      ...body,
    });
  }

  // Decorator to create a server sent event with a path 'events'
  @Sse('events')
  // return an Observable after operations applied on pipe
  events(@Param('wallet_id') wallet_id: string): Observable<MessageEvent> {
    // call wallet assets service subscribeEvents on wallet-assets.service.ts with the wallet id param
    return this.walletAssetsService.subscribeEvents(wallet_id).pipe( // pipe is an instance method  and apply a map operator
      map((event) => ({ // Operator takes in the values from one Observable, and creates a new observable that emits altered values of the original Observable's value, without affecting the original Observable
        type: event.event,
        data: event.data,
      })),
    );
  }
}
