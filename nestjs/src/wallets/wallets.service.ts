import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prismaService: PrismaService) {}

  // method to return all wallets on MongoDB
  all() {
    return this.prismaService.wallet.findMany();
  }
  
  // method to create a new wallet
  create(input: { id: string }) {
    return this.prismaService.wallet.create({
      data: {
        id: input.id,
      },
    });
  }
}
