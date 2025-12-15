import { Injectable } from '@nestjs/common';
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import Cypher, { With } from "@neo4j/cypher-builder";
import { CollectionNameDto } from "./dto/collection-name.dto";

@Injectable()
export class CollectionService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
  ) {}

  async getFilterable(): Promise<Record<string, CollectionNameDto[]>> {
    const guidelines = await this.guidelinesService.get();
    const filterableCollections =
      guidelines.scenarios.findByCollection.filterable;

    const record: Record<string, CollectionNameDto[]> = {};
    for (const filt of filterableCollections) {
      record[filt] = await this.getCollectionNamesOfType(filt);
    }

    return record;
  }

  async getCollectionNamesOfType(
    collectionType: string,
    parentId?: string,
  ): Promise<CollectionNameDto[]> {
    const guidelines = await this.guidelinesService.get();
    const colIdLabel = guidelines.collection.idLabel;
    const colNameLabel = guidelines.collection.nameLabel;

    const col = new Cypher.Node();
    let pattern = new Cypher.Pattern(col, {
      labels: [
        guidelines.collection.metaType,
        new Cypher.Param(collectionType),
      ],
    });

    if (parentId) {
      const parentCol = new Cypher.Node();
      pattern = pattern
        .related(new Cypher.Variable(), { type: "PART_OF" })
        .to(parentCol)
        .where(
          Cypher.eq(parentCol.property(colIdLabel), new Cypher.Param(parentId)),
        );
    }

    const clause = new Cypher.Match(pattern).return(
      [col.property(colIdLabel), "id"],
      [col.property(colNameLabel), "label"],
    );
    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ id: string; label: string }>(
      cypher,
      params,
    );

    const collections = res.records.map((record) => ({
      id: record.get("id"),
      label: record.get("label"),
    }));

    return collections;
  }

  async getCollectionsOfEntityNode(
    entityNode: Cypher.Node,
    query
  ): Promise<[With, Cypher.Variable]> {
    const guidelines = await this.guidelinesService.get();

    // Node-Variablen
    const ann = new Cypher.Node();
    const col = new Cypher.Node();
    const parentCol = new Cypher.Node();


    const matchCollections = new Cypher.Match(
      new Cypher.Pattern(entityNode)
        .related(new Cypher.Relationship(), {
          direction: "left",
          type: "REFERS_TO",
        })
        .to(ann)
        .related(new Cypher.Relationship(), {
          direction: "left",
          type: "HAS_ANNOTATION",
        })
        .to(col),
    );


    const optionalParents = new Cypher.OptionalMatch(
      new Cypher.Pattern(col)
        .related(undefined, {
          direction: "right",
          type: "PART_OF",
          length: "*",
        })
        .to(parentCol),
    );

    const collections = new Cypher.Variable()

    const withClause = new Cypher.With(entityNode, [
      Cypher.collect(
        new Cypher.Map({
          id: col.property(guidelines.collection.idLabel),
          label: col.property(guidelines.collection.nameLabel),
        }),
      ),
      collections,
    ]).distinct();

    const clause = query
      .match(matchCollections)
      .optionalMatch(optionalParents)
      .with(withClause);

    return [clause, collections];
  }

  async getCollectionsOfEntity(
    entityId: string,
  ): Promise<CollectionNameDto[]> {
    const guidelines = await this.guidelinesService.get();

    const eIdLabel = guidelines.entity.idLabel;
    const colIdLabel = guidelines.collection.idLabel;
    const colNameLabel = guidelines.collection.nameLabel;

    // Node-Variablen
    const entity = new Cypher.Node();
    const ann = new Cypher.Node();
    const col = new Cypher.Node();
    const parentCol = new Cypher.Node();

    // MATCH-Pfad:
    // (entity {id})<-[:REFERS_TO]-(ann)<-[:HAS_ANNOTATION]-(col)
    // OPTIONAL MATCH: (col)-[:PART_OF*]->(parentCol)
    const matchEntity = new Cypher.Match(
      new Cypher.Pattern(entity).where(
        Cypher.eq(entity.property(eIdLabel), new Cypher.Param(entityId)),
      ),
    );

    const matchCollections = new Cypher.Match(
      new Cypher.Pattern(entity)
        .related(undefined, { direction: "left", type: "REFERS_TO" })
        .to(ann)
        .related(undefined, { direction: "left", type: "HAS_ANNOTATION" })
        .to(col),
    );

    const optionalParents = new Cypher.OptionalMatch(
      new Cypher.Pattern(col)
        .related(undefined, {
          direction: "right",
          type: "PART_OF",
          length: "*",
        })
        .to(parentCol),
    );

    const returnClause = new Cypher.Return(
      [col.property(colIdLabel), "id"],
      [col.property(colNameLabel), "label"],
    ).distinct();

    const clause = matchEntity
      .match(matchCollections)
      .optionalMatch(optionalParents)
      .return(returnClause);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ id: string; label: string }>(
      cypher,
      params,
    );

    return res.records.map((record) => ({
      id: record.get("id"),
      label: record.get("label"),
    }));
  }

}
