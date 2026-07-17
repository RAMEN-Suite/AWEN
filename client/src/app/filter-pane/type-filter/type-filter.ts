import { Component, computed, effect, inject, model } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { ConfigService } from '../../config-module/config.service';

@Component({
  selector: 'app-type-filter',
  imports: [Checkbox, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './type-filter.html',
})
export class TypeFilter {
  private configService = inject(ConfigService);

  public form = model.required<FormControl<string[]>>();

  protected config = this.configService.getConfig();
  protected types = computed(() => this.config().entityTypes);

  public constructor() {
    effect(() => {
      const availableTypes = this.types();
      const current = this.form().value;
      const next = current.filter((type) => availableTypes.includes(type));

      if (!this.arraysEqual(current, next)) {
        this.form().setValue(next, { emitEvent: false });
      }
    });
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
}
