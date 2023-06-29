import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

// moduel with a global decorator, all modules will be able to use that definition and connection
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

