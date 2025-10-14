import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from "@nestjs/swagger";
import { GetFilterableCollections } from "./dto/get-filterable-collections.dto";
import { CollectionService } from "./collection.service";

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

}
