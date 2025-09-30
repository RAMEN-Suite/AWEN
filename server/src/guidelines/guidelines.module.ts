import { Global, Module } from "@nestjs/common";
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';

@Global()
@Module({
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService]
})
export class GuidelinesModule {}
