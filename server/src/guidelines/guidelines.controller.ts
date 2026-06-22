import { Controller, Get, Param } from '@nestjs/common';
import { GuidelinesService } from './guidelines.service';
import { ApiResponse } from '@nestjs/swagger';
import { EmConfigDto } from './dto/em-config.dto';

@Controller('guidelines')
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

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
    return this.guidelinesService.getEntityProperties(type);
  }
}
