import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect(); // connection with monto
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit', async () => {
      await app.close(); // close the connection with Mongo
    });
  }
}

