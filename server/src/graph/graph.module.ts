import { Module } from '@nestjs/common';
import { NodeRepository } from './node-repository.service';
import { RelationRepository } from './relation-repository.service';

@Module({
  providers: [NodeRepository, RelationRepository],
  exports: [NodeRepository, RelationRepository],
})
export class GraphModule {}
