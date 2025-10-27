import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { EntityService } from "./entity.service";
import { IdDto } from "./dto/id.dto";
import { LabelDto } from "./dto/label.dto";
import { EntityDto } from "./dto/entity.dto";
import { EntityNamesDto } from "./dto/entity-names.dto";
import {
  parseStringToSearchQueryString,
} from "../utils/utils";
import { EntitySearchDto } from "./dto/entity-search.dto";
import { ApiResponse } from "@nestjs/swagger";

@Controller('entity')
export class EntityController {

  constructor(private readonly entityService: EntityService) {}


  @ApiResponse({ type: [EntityDto] })
  @Get('')
  async getAutoCompleteF(@Query() params: EntitySearchDto): Promise<EntityDto[]> {
    const { label, collectionFilter } = params;


    const searchQuery = parseStringToSearchQueryString(label);
    const entities = await this.entityService.find({
      ...params,
      label: searchQuery
    });

    return entities;
  }


  @ApiResponse({ type: EntityDto })
  @Get(':id')
  async getById(@Param() params: IdDto): Promise<EntityDto> {
    const { id } = params;

    const entity = await this.entityService.findOneById(id);

    if (!entity) {
      throw new NotFoundException('Entity was not found!');
    }

    return entity;
  }

  @ApiResponse({ type: [EntityNamesDto] })
  @Get('auto-complete/:label')
  async getAutoComplete(@Param() params: LabelDto): Promise<EntityNamesDto[]> {
    const { label } = params;
    const searchQuery = parseStringToSearchQueryString(label);
    const entities = await this.entityService.findNamesByName(searchQuery);

    return entities;
  }



}
