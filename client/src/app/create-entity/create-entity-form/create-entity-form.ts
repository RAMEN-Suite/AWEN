import { Component, inject, signal, Signal, WritableSignal } from '@angular/core';
import { CreateEntityService } from '../create-entity.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DataType, GAttribute } from '../../../interfaces';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { ConfigService } from '../../config-module/config.service';
import { ToggleButton } from 'primeng/togglebutton';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-create-entity-form',
  imports: [Select, ReactiveFormsModule, InputText, FloatLabel, Button, ToggleButton, InputNumber],
  templateUrl: './create-entity-form.html',
})
export class CreateEntityForm {
  createEntityService = inject(CreateEntityService);
  configService = inject(ConfigService);

  readonly dataTypes: Signal<DataType[]> = this.configService.getDataTypes();

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
      const formControl = this.createFormControl(prop);
      if (!formControl) continue;
      controlls[prop.name] = formControl;
    }

    this.propertiesForm = new FormGroup(controlls);
  }

  protected async clickCreateButton() {
    await this.createEntityService.createEntity(this.typeInput.value, this.createPayload());
  }

  private createPayload() {
    const payload: Record<string, unknown> = {};
    Object.entries(this.propertiesForm.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload[key] = value;
      }
    });
    return payload;
  }

  private createFormControl(prop: GAttribute): FormControl | undefined {
    const dataType = this.findDataType(prop.typeId);
    if (!dataType) {
      return undefined;
    }
    let form: FormControl | undefined = undefined;

    if (dataType.name.toLowerCase() === 'string') {
      form = new FormControl<string | null>(null, { nonNullable: false });
    }

    if (dataType.name.toLowerCase() === 'integer') {
      form = new FormControl<number | null>(null, { nonNullable: false });
    }

    if (dataType.name.toLowerCase() === 'float') {
      form = new FormControl<number | null>(null, { nonNullable: false });
    }

    if (dataType.name.toLowerCase() === 'boolean') {
      form = new FormControl<boolean>(false, { nonNullable: true });
    }

    return form;
  }

  protected findDataType(id: string) {
    return this.dataTypes().find((dataType) => dataType.id === id);
  }
}
