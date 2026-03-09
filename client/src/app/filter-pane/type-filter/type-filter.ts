import { Component, effect, inject, model, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { TitleCasePipe } from '@angular/common';
import { ConfigService } from '../../config-module/config.service';

@Component({
  selector: 'app-type-filter',
  imports: [Checkbox, ReactiveFormsModule, TitleCasePipe, FormsModule],
  templateUrl: './type-filter.html',
})
export class TypeFilter implements OnInit {
  private configService = inject(ConfigService);

  form = model.required<FormControl<string[]>>();

  protected activeTypes = signal<string[]>([]);
  protected types = signal<string[]>([]);

  constructor() {
    effect(() => {
      const config = this.configService.getConfig();
      this.types.set(config().entityTypes);
      const opts = this.activeTypes();
      this.form().setValue(opts);
    });
  }

  async ngOnInit(): Promise<void> {
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
