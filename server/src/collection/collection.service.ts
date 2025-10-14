import { Injectable } from '@nestjs/common';
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import Cypher from "@neo4j/cypher-builder";
import { CollectionName } from "./dto/collection-name.dto";

@Injectable()
export class CollectionService {

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
  ) {
  }

  async getFilterable(): Promise<Record<string, CollectionName[]>> {
    const guidelines = await this.guidelinesService.get();
    const filterableCollections =
      guidelines.scenarios.findByCollection.filterable;

    const record: Record<string, CollectionName[]> = {};
    for (const filt of filterableCollections) {
      record[filt] = await this.getCollectionNamesOfType(filt);
    }

    return record;
  }


  private async getCollectionNamesOfType(collectionType: string): Promise<CollectionName[]> {
    const guidelines = await this.guidelinesService.get();
    const colIdLabel = guidelines.collection.idLabel;
    const colNameLabel = guidelines.collection.nameLabel;

    const col = new Cypher.Node();
    const pattern = new Cypher.Pattern(col, { labels: collectionType });

    const clause = new Cypher.Match(pattern).return([col.property(colIdLabel), 'id'], [col.property(colNameLabel), 'label']);
    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ id: string, label: string }>(
      cypher,
      params,
    );

    const collections = res.records.map((record) => ({
      id: record.get('id'),
      label: record.get('label'),
    }))

    return collections;
  }

}
