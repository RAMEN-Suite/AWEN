import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import Cypher, { Expr, LabelExpr } from '@neo4j/cypher-builder';
import { GetNodeByIdOptions } from './interfaces/get-node-by-id-options.interface';

type NodePatternOptions = {
  labels?: string | Array<string | Expr> | LabelExpr | Expr;
  properties?: Record<string, Expr>;
};

@Injectable()
export class NodeRepository {
  logger = new Logger(NodeRepository.name);

  constructor(private neo4j: Neo4jService) {
    this.getById('fa3246bc-4ac9-4271-906d-3e4d768ccd5f')
      .then((node) => {
        this.logger.log(`found node ${JSON.stringify(node)}`);
      })
      .catch((err) => {
        this.logger.error(
          `could not find node`,
          err instanceof Error ? err.stack : undefined,
        );
      });
  }

  async getById(uuid: string, options?: GetNodeByIdOptions) {
    const NODE_NAME = 'node';

    const patternOptions: NodePatternOptions = {};

    if (options?.labels) {
      patternOptions.labels = options.labels;
    }
    const node = new Cypher.NamedNode(NODE_NAME);
    const pattern = new Cypher.Pattern(node, patternOptions);

    const { cypher, params } = new Cypher.Match(pattern)
      .where(Cypher.eq(node.property('uuid'), new Cypher.Param(uuid)))
      .return(node)
      .build();

    const result = await this.neo4j.read<{ [NODE_NAME]: object }>(
      cypher,
      params,
    );

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get(NODE_NAME);
  }
}
