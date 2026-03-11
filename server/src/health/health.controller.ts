import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getServerStatus() {
    return {
      version: this.configService.get<string>('APP_VERSION') || '0.0.0',
      healthy: true,
    };
  }
}
