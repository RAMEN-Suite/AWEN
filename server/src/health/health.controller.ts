import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RamenModelService } from '../schema/ramen-model.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly ramenService: RamenModelService,
  ) {}

  @Get()
  getServerStatus() {
    return {
      version: this.configService.get<string>('APP_VERSION') || '0.0.0',
      ramenVersion: this.ramenService.ramenVersion,
      healthy: true,
    };
  }
}
