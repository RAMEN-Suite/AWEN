import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { EntityService } from './entity.service';
import { IdDto } from './dto/id.dto';
import { LabelDto } from './dto/label.dto';
import { OldEntityDto } from './dto/old-entity.dto';
import { EntityNamesDto } from './dto/entity-names.dto';
import { parseStringToSearchQueryString } from '../utils/utils';
import { EntitySearchDto } from './dto/entity-search.dto';
import { ApiResponse } from '@nestjs/swagger';
import { EntityCollectionNameDto } from './dto/entity-collection-name.dto';
import { EntityAutocompleteQueryDto } from './dto/entity-autocomplete-query.dto';
import { EntityDto } from './dto/entity.dto';

@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @ApiResponse({ type: [OldEntityDto] })
  @Get('')
  async getAutoCompleteF(
    @Query() params: EntitySearchDto,
  ): Promise<EntityCollectionNameDto[]> {
    const { label } = params;

    const searchQuery = parseStringToSearchQueryString(label);
    const entities = await this.entityService.find({
      ...params,
      label: searchQuery,
    });

    return entities;
  }

  @ApiResponse({ type: EntityDto })
  @Get(':id')
  async getById(@Param() params: IdDto): Promise<EntityDto> {
    const { id } = params;

    const entity = await this.entityService.getById(id);

    if (!entity) {
      throw new NotFoundException('Entity was not found!');
    }

    return entity;
  }

  @ApiResponse({ type: [EntityNamesDto] })
  @Get('auto-complete/:label')
  async getAutoComplete(
    @Param() params: LabelDto,
    @Query() qParams: EntityAutocompleteQueryDto,
  ): Promise<EntityNamesDto[]> {
    const { label } = params;
    const searchQuery = parseStringToSearchQueryString(label);
    const entities = await this.entityService.findNamesByName(
      searchQuery,
      qParams,
    );

    return entities;
  }
}
