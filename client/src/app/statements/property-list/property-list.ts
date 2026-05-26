import { Component, input } from '@angular/core';
import { Chip } from 'primeng/chip';
import { visibleProperties } from '../../utils/utils';
import { NodePropertyDto } from '../../../interfaces';

@Component({
  selector: 'app-property-list',
  imports: [Chip],
  templateUrl: './property-list.html',
})
export class PropertyList {
  properties = input.required<NodePropertyDto[]>();

  protected readonly visibleProperties = visibleProperties;

  protected isArrayValue(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  protected displayValue(value: unknown): string {
    return String(value ?? '');
  }
}
