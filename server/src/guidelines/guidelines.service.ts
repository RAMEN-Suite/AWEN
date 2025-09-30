import { Injectable } from '@nestjs/common';
import guidelinesJSON from '../../guidelines.json'
import { IGuidelines } from "../../shared/IGuidelines";


@Injectable()
export class GuidelinesService {

  async get(): Promise<IGuidelines> {
    return guidelinesJSON as IGuidelines;
  }
}
