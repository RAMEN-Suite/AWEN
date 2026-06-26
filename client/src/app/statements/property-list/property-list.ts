import { Component, computed, input } from '@angular/core';
import { Chip } from 'primeng/chip';
import { visibleProperties } from '../../utils/utils';
import { NodePropertyDto } from '../../../interfaces';

type TextSize = 3 | 4 | 5 | 6 | 7 | 8 | 9;

@Component({
  selector: 'app-property-list',
  imports: [Chip],
  templateUrl: './property-list.html',
})
export class PropertyList {
  properties = input.required<NodePropertyDto[]>();
  textSize = input<TextSize>(3);

  protected lableTextSizeClass = computed(() => {
    return this.getTextSizeClass(this.textSize() - 2);
  });

  protected valueTextSizeClass = computed(() => {
    return this.getTextSizeClass(this.textSize());
  });

  protected readonly visibleProperties = visibleProperties;

  protected isArrayValue(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  protected displayValue(value: unknown): string {
    return String(value ?? '');
  }

  private getTextSizeClass(textSize: number) {
    switch (textSize) {
      case 1:
        return 'text-xs';
      case 2:
        return 'text-sm';
      case 3:
        return 'text-base';
      case 4:
        return 'text-lg';
      case 5:
        return 'text-xl';
      case 6:
        return 'text-2xl';
      case 7:
        return 'text-3xl';
      case 8:
        return 'text-4xl';
      case 9:
        return 'text-5xl';
      default:
        return 'text-base';
    }
  }
}
