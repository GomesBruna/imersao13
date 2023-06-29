import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Observable, map } from 'rxjs';

@Controller('assets') // Controller decorator and API prefixo ('assets)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get() // Get decorator with params or path, in that case none
  all() {
    return this.assetsService.all(); // Call assetsServices all on assets.services.ts
  }

  @Post() //Post decorator with params or path, in that case none
  create(@Body() body: { id: string; symbol: string; price: number }) {
    return this.assetsService.create(body); // Call assetsServices create on assets.services.ts 
  }

  @Get(':id') // Get decorator with params or path, in that case a param id
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id); // Call assetsServices finOne ib assets.services.ts
  }


  // Decorator to create a server sent event with a path 'events'
  @Sse('events')
  // return an Observable after operations applied on pipe
  events(): Observable<MessageEvent> {
    // call assetsService subscribeEvents on assets.service.ts
    return this.assetsService.subscribeEvents().pipe( // pipe is an instance method  and apply a map operator
      map((event) => ({ // Operator takes in the values from one Observable, and creates a new observable that emits altered values of the original Observable's value, without affecting the original Observable.
        type: event.event,
        data: event.data,
      })),
    );
  }
}
