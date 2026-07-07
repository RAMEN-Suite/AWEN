import { Global, Module } from '@nestjs/common';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { SchemaModule } from '../schema/schema.module';
import { CamiModule } from '../cami/cami.module';

@Global()
@Module({
  imports: [SchemaModule, CamiModule],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService],
})
export class GuidelinesModule {}
