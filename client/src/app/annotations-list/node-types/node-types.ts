import {
  booleanAttribute,
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Chip } from 'primeng/chip';
import {
  ANNOTATION_LABEL_NAME,
  COLLECTION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../../../constants';

const RAMEN_CORE_TYPES = [
  ENTITY_LABEL_NAME,
  ANNOTATION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  COLLECTION_LABEL_NAME,
];

@Component({
  selector: 'app-node-types',
  imports: [Chip],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './node-types.html',
})
export class NodeTypes {
  public nodeTypes = input.required<string[]>();
  public asChips = input(false, { transform: booleanAttribute });
  public hideRamenCoreTypes = input(false, { transform: booleanAttribute });

  protected readonly formatedTypes = computed(() => {
    const types = [...this.nodeTypes()].reverse();
    if (this.hideRamenCoreTypes()) {
      return types.filter((type) => {
        return !RAMEN_CORE_TYPES.includes(type);
      });
    }
    return types;
  });
}
