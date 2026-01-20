import { Component, effect, inject, model, OnInit, signal } from '@angular/core';
import { GuidelinesService } from '../../api/guidelines.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-type-filter',
  imports: [Checkbox, ReactiveFormsModule, TitleCasePipe, FormsModule],
  templateUrl: './type-filter.html',
})
export class TypeFilter implements OnInit {
  guidelines = inject(GuidelinesService);

  form = model.required<FormControl<string[]>>();

  protected activeTypes = signal<string[]>([]);
  protected types = signal<string[]>([]);

  constructor() {
    effect(() => {
      const opts = this.activeTypes();
      this.form().setValue(opts);
    });
  }

  async ngOnInit(): Promise<void> {
    const g = await this.guidelines.get();
    this.types.set(g.entity.types);
    this.form().valueChanges.subscribe((value) => {
      if (value !== this.activeTypes()) {
        for (const val of value) {
          if (this.types().includes(val)) {
            this.activeTypes.update((old) => {
              return [...old, val];
            });
          }
        }
      }
    });
  }
}
