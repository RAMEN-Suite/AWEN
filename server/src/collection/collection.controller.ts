import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse } from "@nestjs/swagger";
import { GetFilterableCollections } from "./dto/get-filterable-collections.dto";
import { CollectionService } from "./collection.service";
import { GetFilterableCollectionsByTypeQueryDto } from "./dto/get-filterable-collections-by-type-query.dto";
import { CollectionNameDto } from "./dto/collection-name.dto";

@Controller('collection')
export class CollectionController {

  constructor(private readonly collectionService: CollectionService) {}

  @ApiResponse({
    type: GetFilterableCollections
  })
  @Get('filterable')
  async getFilterable(): Promise<GetFilterableCollections> {
    return {
      collectionFilter: await this.collectionService.getFilterable()
    };
  }

  @ApiResponse({
    type: GetFilterableCollections
  })
  @Get('filterable/:type')
  async getFilterableByType(@Query() queryParams: GetFilterableCollectionsByTypeQueryDto, @Param('type') type: string): Promise<CollectionNameDto[]> {
    const { parentId } = queryParams;
    const collectionType = type;

    return await this.collectionService.getCollectionNamesOfType(collectionType, parentId);
  }

}
