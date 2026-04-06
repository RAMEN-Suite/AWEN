import { Component, effect, inject, input, signal, Signal, WritableSignal } from '@angular/core';
import { CreateEntityService } from '../create-entity.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DataType, GAttribute } from '../../../interfaces';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { ConfigService } from '../../config-module/config.service';
import { ToggleButton } from 'primeng/togglebutton';
import { InputNumber } from 'primeng/inputnumber';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { KeyFilter } from 'primeng/keyfilter';
import { hidden } from '@angular/forms/signals';

@Component({
  selector: 'app-create-entity-form',
  imports: [Select, ReactiveFormsModule, InputText, FloatLabel, Button, ToggleButton, InputNumber, AutoComplete, KeyFilter],
  templateUrl: './create-entity-form.html',
})
export class CreateEntityForm {
  createEntityService = inject(CreateEntityService);
  configService = inject(ConfigService);
  private readonly messageService = inject(MessageService);
  dialogRef = inject(DynamicDialogRef);

  preselectedType = input<string>();

  readonly dataTypes: Signal<DataType[]> = this.configService.getDataTypes();

  readonly types: Signal<string[]> = this.createEntityService.getEntityTypes();
  readonly typesLoaded: Signal<boolean> = this.createEntityService.getEntityTypesLoaded();
  readonly properties: WritableSignal<GAttribute[]> = signal<GAttribute[]>([]);
  readonly propertiesLoaded: WritableSignal<boolean> = signal<boolean>(true); // TODO: UI Loading state

  typeInput = new FormControl('', { nonNullable: true });

  propertiesForm = new FormGroup({});

  constructor() {
    effect(async () => {
      const type = this.preselectedType();
      if (type) {
        this.typeInput.setValue(type, { emitEvent: false });
        await this.loadAndDisplayPropertyInputs(type);
      }
    });
    this.typeInput.valueChanges.subscribe(async (value) => {
      await this.loadAndDisplayPropertyInputs(value);
    });
  }

  private async loadAndDisplayPropertyInputs(type: string) {
    this.propertiesLoaded.set(false);
    const props: GAttribute[] = await this.createEntityService.getEntityProperties(type);
    this.properties.set(props);
    this.fillPropertyFormGroup(props);
    this.propertiesLoaded.set(true);
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
    this.propertiesForm.disable();
    try {
      const createdId = await this.createEntityService.createEntity(this.typeInput.value, this.createPayload());
      this.messageService.add({
        severity: 'success',
        summary: `Entity with id ${createdId} Successfully created!`,
        life: 12000,
        // TODO: Link to detail page
      });
      this.dialogRef.close();
    } catch {
      /* empty */
    }
    this.propertiesForm.disable();
  }

  private createPayload() {
    const payload: Record<string, unknown> = {};

    Object.entries(this.propertiesForm.value).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      const prop = this.properties().find((p) => p.name === key);
      if (!prop) return;

      const dataType = this.findDataType(prop.typeId);
      if (!dataType) return;

      const isArray = prop.bounds.upperBound === -1 || prop.bounds.upperBound > 1;

      if (isArray && Array.isArray(value)) {
        payload[key] = value.map((v) => this.castValue(v, dataType.name));
      } else {
        payload[key] = this.castValue(value, dataType.name);
      }
    });

    return payload;
  }

  private castValue(value: unknown, dataTypeName: string): unknown {
    switch (dataTypeName.toLowerCase()) {
      case 'integer':
        return parseInt(String(value), 10);
      case 'float':
        return parseFloat(String(value));
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }

  private isArray(bounds: { lowerBound: number; upperBound: number }): boolean {
    return bounds.upperBound === -1 || bounds.upperBound > 1;
  }

  private createFormControl(prop: GAttribute): FormControl | undefined {
    const dataType = this.findDataType(prop.typeId);
    if (!dataType) return undefined;

    const { lowerBound, upperBound } = prop.bounds;
    const isArray = this.isArray(prop.bounds);

    const validators = [...(lowerBound >= 1 ? [Validators.required] : [])];

    if (isArray) {
      validators.push(Validators.minLength(lowerBound), ...(upperBound !== -1 ? [Validators.maxLength(upperBound)] : []));
    }

    switch (dataType.name.toLowerCase()) {
      case 'string':
        return new FormControl<string | string[] | null>(isArray ? [] : null, { validators });
      case 'integer':
      case 'float':
        return new FormControl<number | number[] | null>(isArray ? [] : null, { validators });
      case 'boolean':
        return isArray ? new FormControl<boolean[]>([], { validators }) : new FormControl<boolean>(false, { nonNullable: true });
      default:
        return undefined;
    }
  }

  protected findDataType(id: string) {
    return this.dataTypes().find((dataType) => dataType.id === id);
  }

  protected readonly hidden = hidden;
}
