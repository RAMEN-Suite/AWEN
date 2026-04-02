import { Component, inject, signal, Signal, WritableSignal } from '@angular/core';
import { CreateEntityService } from '../create-entity.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { GAttribute } from '../../../interfaces';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-create-entity-form',
  imports: [Select, ReactiveFormsModule, InputText, FloatLabel, Button],
  templateUrl: './create-entity-form.html',
})
export class CreateEntityForm {
  createEntityService = inject(CreateEntityService);

  readonly types: Signal<string[]> = this.createEntityService.getEntityTypes();
  readonly typesLoaded: Signal<boolean> = this.createEntityService.getEntityTypesLoaded();
  readonly properties: WritableSignal<GAttribute[]> = signal<GAttribute[]>([]);
  readonly propertiesLoaded: WritableSignal<boolean> = signal<boolean>(true);

  typeInput = new FormControl('', { nonNullable: true });

  propertiesForm = new FormGroup({});

  constructor() {
    this.typeInput.valueChanges.subscribe(async (value) => {
      this.propertiesLoaded.set(false);
      const props: GAttribute[] = await this.createEntityService.getEntityProperties(value);
      this.properties.set(props);
      this.fillPropertyFormGroup(props);
      this.propertiesLoaded.set(true);
    });
  }

  private fillPropertyFormGroup(props: GAttribute[]) {
    const controlls: Record<string, FormControl> = {};

    for (const prop of props) {
      controlls[prop.name] = new FormControl<string>('', { nonNullable: false });
    }

    this.propertiesForm = new FormGroup(controlls);
  }

  protected clickCreateButton() {
    const val = this.propertiesForm.value;
    console.log(val);
  }
}
