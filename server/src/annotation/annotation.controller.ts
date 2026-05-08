import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { EntityService } from '../entity/entity.service';
import { ApiResponse } from '@nestjs/swagger';
import { IdDto } from '../dto/id.dto';
import { DeleteAnnotationConnectionReqDto } from './dto/delete-annotation-connection.req.dto';

@Controller('annotation')
export class AnnotationController {
  constructor(
    private readonly annotationService: AnnotationService,
    private readonly entityService: EntityService,
  ) {}

  @Delete(':id')
  async delete(@Param() params: IdDto): Promise<void> {
    const { id } = params;
    await this.annotationService.delete(id);
  }

  @Delete(':id/connection/:connectedId')
  async deleteConnection(
    @Param() params: DeleteAnnotationConnectionReqDto,
  ): Promise<void> {
    const { id, connectedId } = params;
    await this.annotationService.deleteConnection(id, connectedId);
  }

  @ApiResponse({ type: IdDto })
  @Post('entity')
  async create(@Body() annotationDto: CreateAnnotationDto): Promise<IdDto> {
    const { entityId, properties } = annotationDto;
    const entity = await this.entityService.getById(entityId);
    if (!entity) {
      throw new BadRequestException('There is no entity with the given id.');
    }
    try {
      const annotationId = await this.annotationService.createForEntity(
        entityId,
        properties,
      );
      return {
        id: annotationId,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid Attributes') {
        throw new BadRequestException(error.cause);
      }
      throw error;
    }
  }
}
