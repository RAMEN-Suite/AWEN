import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { EntityResolver } from './entity.resolver';


@Module({
  controllers: [],
  providers: [EntityService, EntityResolver]
})
export class EntityModule {}
