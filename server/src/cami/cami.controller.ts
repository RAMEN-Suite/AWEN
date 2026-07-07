import { Controller, Get, Param, Res } from '@nestjs/common';
import { CamiService } from './cami.service';
import express from 'express';

@Controller('cami')
export class CamiController {
  constructor(private readonly camService: CamiService) {}

  @Get('collections/:id')
  redirectToCollections(@Param('id') id: string, @Res() res: express.Response) {
    res.redirect(this.camService.getCollectionUrl(id));
  }

  @Get('contents/:id')
  redirectToContents(@Param('id') id: string, @Res() res: express.Response) {
    res.redirect(this.camService.getContentUrl(id));
  }
}
