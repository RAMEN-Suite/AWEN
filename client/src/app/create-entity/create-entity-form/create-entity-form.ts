import { Component, computed, effect, inject, input, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { CreateEntityService } from '../create-entity.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { GAttribute } from '../../../interfaces';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ENTITY_NAME_PROPERTY } from '../../../constants';
import { ConfigService } from '../../config-module/config.service';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';

@Component({
  selector: 'app-create-entity-form',
  imports: [Select, ReactiveFormsModule, FloatLabel, Button, AttributeForm],
  templateUrl: './create-entity-form.html',
})
export class CreateEntityForm {
  private readonly createEntityService = inject(CreateEntityService);
  private readonly configService = inject(ConfigService);
  private readonly messageService = inject(MessageService);
  dialogRef = inject(DynamicDialogRef);

  preselectedType = input<string>();

  readonly types: Signal<string[]> = this.createEntityService.getEntityTypes();
  readonly typesLoaded: Signal<boolean> = this.createEntityService.getEntityTypesLoaded();
  readonly properties: WritableSignal<GAttribute[]> = signal<GAttribute[]>([]);
  readonly propertiesLoaded: WritableSignal<boolean> = signal<boolean>(true); // TODO: UI Loading state

  attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  typeInput = new FormControl('', { nonNullable: true });

  propertiesForm = computed(() => this.attributeForm().propertiesForm());

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
    this.propertiesLoaded.set(true);
  }

  protected async clickCreateButton() {
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
  }

  private createPayload() {
    const payload: Record<string, unknown> = {};

    Object.entries(this.propertiesForm().value).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      const prop = this.properties().find((p) => p.name === key);
      if (!prop) return;

      const dataType = this.configService.findDataType(prop.typeId);
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

  protected readonly ENTITY_NAME_PROPERTY = ENTITY_NAME_PROPERTY;
}
