import { Controller, Get } from '@nestjs/common';
import { IGuidelines } from "../../shared/IGuidelines";
import { GuidelinesService } from "./guidelines.service";
import { ApiResponse } from "@nestjs/swagger";

@Controller('guidelines')
export class GuidelinesController {

  constructor(private readonly guidelinesService: GuidelinesService ) {}

  @ApiResponse({
    type: IGuidelines
  })
  @Get('')
  async get() {
    return this.guidelinesService.get();
  }
}
