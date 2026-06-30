import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import Cypher, { Expr, LabelExpr } from '@neo4j/cypher-builder';
import { GetNodeByIdOptions } from './interfaces/get-node-by-id-options.interface';
import { Integer, Node } from 'neo4j-driver';
import { GetNodeOptions } from './interfaces/get-node-options.interface';

type NodePatternOptions = {
  labels?: string | Array<string | Expr> | LabelExpr | Expr;
  properties?: Record<string, Expr>;
};

@Injectable()
export class NodeRepository {
  logger = new Logger(NodeRepository.name);

  constructor(private neo4j: Neo4jService) {
    this.getById('fa3246bc-4ac9-4271-906d-3e4d768ccd5f')
      .then(() => {
        this.logger.log('getById() is working!');
      })
      .catch((err) => {
        this.logger.error(`could not find node`, err instanceof Error ? err.stack : undefined);
      });
    this.getByProperty('label', 'Acqui')
      .then(() => {
        this.logger.log('getByProperty() is working!');
      })
      .catch((err) => {
        this.logger.error(`could not find node`, err instanceof Error ? err.stack : undefined);
      });
    this.indexFulltextQueryNodes('search', 'Aachen')
      .then(() => {
        this.logger.log('indexFulltextQueryNodes() is working!');
      })
      .catch((err) => {
        this.logger.error(`could not find node`, err instanceof Error ? err.stack : undefined);
      });
  }

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
      [NODE_NAME]: Node<Integer, Record<string, any>>;
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
      [NODE_NAME]: Node<Integer, Record<string, any>>;
    }>(cypher, params);

    return result.records.map((record) => record.get(NODE_NAME));
  }

  async indexFulltextQueryNodes(fulltextIndex: string, query: string) {
    const procedure = Cypher.db.index.fulltext.queryNodes(new Cypher.Literal(fulltextIndex), new Cypher.Param(query));
    const { cypher, params } = procedure.build();
    const result = await this.neo4j.read<{
      node: Node<Integer, Record<string, any>>;
      score: Integer;
    }>(cypher, params);

    return result.records.map((record) => ({
      node: record.get('node'),
      score: record.get('score'),
    }));
  }
}
