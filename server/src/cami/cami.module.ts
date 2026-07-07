import { Module } from '@nestjs/common';
import { CamiService } from './cami.service';
import { CamiController } from './cami.controller';

@Module({
  imports: [],
  providers: [CamiService],
  exports: [CamiService],
  controllers: [CamiController],
})
export class CamiModule {}
