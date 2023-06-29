import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Sse,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AssetsDailyService } from './assets-daily.service';

// assets daily is a service and model to save price changes intra day on an asset
@Controller('assets/:id/daily') // Controller decorator with path prefix and params, that way the url to reach will be
// localhost:3000/assets/id/daily, where id will be a param
// Params or path put on Controller decorate are valid to all function in that controller
export class AssetsDailyController {
  constructor(private assetsDaily: AssetsDailyService) {}

  @Get() // Get decorator with any additional param or path 
  all(@Param('id') id: string) {
    return this.assetsDaily.findAll(id); // use the param id to run the function findAll on assets-daily.service.ts
  }

  // Decorator to create a server sent event with a path 'events'
  @Sse('events')
  // return an Observable after operations applied on pipe
  events(@Param('id') id: string): Observable<MessageEvent> {
    // call assetsService subscribeEvents on assets-daily.service.ts with the id param
    return this.assetsDaily.subscribeEvents(id).pipe( // pipe is an instance method  and apply a map operator
      map((event) => ({ // Operator takes in the values from one Observable, and creates a new observable that emits altered values of the original Observable's value, without affecting the original Observable.
        type: event.event,
        data: event.data,
      })),
    );
  }
}
