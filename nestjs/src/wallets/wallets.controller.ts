import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';

// // Controller decorator and api url localhost:300/prefix -> prefix 'wallets'
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  // Get decorator to specify behaviour of a get call, call all() method from wallets.service.ts
  @Get()
  all() {
    return this.walletsService.all();
  }

  // Post decorator to specify behaviour of a post call, on body we have an ID and call create() method from wallets.service.ts
  @Post()
  create(@Body() body: { id: string }) {
    return this.walletsService.create({
      id: body.id,
    });
  }
}
