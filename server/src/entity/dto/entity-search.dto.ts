import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from 'class-transformer';

export class EntitySearchDto {

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return undefined; }
  }, { toClassOnly: true })
  collectionFilter?: Record<string, string[]>;


}