import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';


@Module({
  controllers: [],
  providers: [EntityService]
})
export class EntityModule {}
