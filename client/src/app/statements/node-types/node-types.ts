import { booleanAttribute, Component, computed, input } from '@angular/core';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-node-types',
  imports: [Chip],
  templateUrl: './node-types.html',
})
export class NodeTypes {
  nodeTypes = input.required<string[]>();
  asChips = input(false, { transform: booleanAttribute });

  protected formatedTypes = computed(()=> Array.from(this.nodeTypes()).reverse())
}
