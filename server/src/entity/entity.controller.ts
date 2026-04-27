import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
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
import { AnnotationService } from '../annotation/annotation.service';
import { AnnotationDto } from '../annotation/dto/annotation.dto';
import { CreateEntityDto } from './dto/create-entity.dto';
import { RAMENError } from '../schema/RAMENError';
import { UpdateEntityDto } from './dto/update-entity.dto';

@Controller('entity')
export class EntityController {
  constructor(
    private readonly entityService: EntityService,
    private readonly annotationService: AnnotationService,
  ) {}

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

  @ApiResponse({ type: IdDto })
  @Post('')
  async create(@Body() body: CreateEntityDto): Promise<IdDto> {
    try {
      const id = await this.entityService.create(body.type, body.properties);
      return {
        id: id,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid Attributes') {
        throw new BadRequestException(error.cause);
      }
      throw error;
    }
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

  @Delete(':id')
  async deleteById(@Param() params: IdDto) {
    const { id } = params;

    try {
      await this.entityService.delete(id);
    } catch (error) {
      if (!(error instanceof RAMENError)) {
        throw new InternalServerErrorException('Could not delete entity');
      }
      throw error;
    }
  }

  @Put(':id')
  async putById(@Param() params: IdDto, @Body() body: UpdateEntityDto) {
    const { id } = params;

    try {
      await this.entityService.update(id, body.properties);
    } catch (error) {
      if (!(error instanceof RAMENError)) {
        throw new InternalServerErrorException('Could not delete entity');
      }
      throw error;
    }
  }

  @ApiResponse({ type: [AnnotationDto] })
  @Get(':id/annotations')
  async getAnnotationsOfEntity(
    @Param() params: IdDto,
  ): Promise<AnnotationDto[]> {
    const { id } = params;

    const annotations: AnnotationDto[] =
      await this.annotationService.getAnnotationsOfEntity(id);

    return annotations;
  }

  @ApiResponse({ type: [AnnotationDto] })
  @Get(':id/annotations/content')
  async getAnnotationsWithContentOfContent(
    @Param() params: IdDto,
  ): Promise<AnnotationDto[]> {
    const { id } = params;

    const annotations: AnnotationDto[] =
      await this.annotationService.getAnnotationsWithReferencesOfContent(id);

    return annotations;
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
