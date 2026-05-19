import { Controller, Get, Param } from '@nestjs/common';
import { IGuidelines } from '../../shared/IGuidelines';
import { GuidelinesService } from './guidelines.service';
import { ApiResponse } from '@nestjs/swagger';
import { EmConfigDto } from './dto/em-config.dto';

@Controller('guidelines')
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @ApiResponse({
    type: IGuidelines,
  })
  @Get('')
  async get() {
    return this.guidelinesService.get();
  }

  @ApiResponse({
    type: EmConfigDto,
  })
  @Get('config')
  getConfig() {
    const config = this.guidelinesService.getConfig();
    return new EmConfigDto(config);
  }

  @Get('config/node/properties/:type')
  getEntityProperties(@Param('type') type: string) {
    const types = this.guidelinesService.getEntityProperties(type);
    return types;
  }
}
