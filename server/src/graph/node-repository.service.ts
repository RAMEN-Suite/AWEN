import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import Cypher, { Expr, LabelExpr } from '@neo4j/cypher-builder';
import { GetNodeByIdOptions } from './interfaces/get-node-by-id-options.interface';
import { Integer, Node } from 'neo4j-driver';
import { GetNodeOptions } from './interfaces/get-node-options.interface';

interface NodePatternOptions {
  labels?: string | (string | Expr)[] | LabelExpr | Expr;
  properties?: Record<string, Expr>;
}

@Injectable()
export class NodeRepository {
  logger = new Logger(NodeRepository.name);

  constructor(private neo4j: Neo4jService) {}

  async getById(uuid: string, options?: GetNodeByIdOptions) {
    const NODE_NAME = 'node';
    const KEY_NAME = options?.keyName ?? 'uuid';

    const patternOptions: NodePatternOptions = {};

    if (options?.labels) {
      patternOptions.labels = options.labels;
    }
    const node = new Cypher.NamedNode(NODE_NAME);
    const pattern = new Cypher.Pattern(node, patternOptions);

    const { cypher, params } = new Cypher.Match(pattern)
      .where(Cypher.eq(node.property(KEY_NAME), new Cypher.Param(uuid)))
      .return(node)
      .build();

    const result = await this.neo4j.read<{
      [NODE_NAME]: Node<Integer, Record<string, unknown>>;
    }>(cypher, params);

    if (result.records.length === 0) {
      return undefined;
    }

    return result.records[0].get(NODE_NAME);
  }

  async getByProperty(propertyName: string, propertyValue: string, options?: GetNodeOptions) {
    const NODE_NAME = 'node';
    const patternOptions: NodePatternOptions = {};

    if (options?.labels) {
      patternOptions.labels = options.labels;
    }
    const node = new Cypher.NamedNode(NODE_NAME);
    const pattern = new Cypher.Pattern(node, patternOptions);

    const { cypher, params } = new Cypher.Match(pattern)
      .where(Cypher.eq(node.property(propertyName), new Cypher.Param(propertyValue)))
      .return(node)
      .build();

    const result = await this.neo4j.read<{
      [NODE_NAME]: Node<Integer, Record<string, unknown>>;
    }>(cypher, params);

    return result.records.map((record) => record.get(NODE_NAME));
  }
}
