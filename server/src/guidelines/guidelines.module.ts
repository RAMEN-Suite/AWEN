import { Global, Module } from '@nestjs/common';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { SchemaModule } from '../schema/schema.module';

@Global()
@Module({
  imports: [SchemaModule],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService],
})
export class GuidelinesModule {}
