import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaBiService } from './prisma-bi.service';

@Global()
@Module({
  providers: [PrismaService, PrismaBiService],
  exports: [PrismaService, PrismaBiService],
})
export class PrismaModule {}
