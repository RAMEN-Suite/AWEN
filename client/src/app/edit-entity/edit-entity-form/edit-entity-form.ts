import { Component, computed, inject, input, signal, Signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Entity, EntityPropertyDto, GAttribute } from '../../../interfaces';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigService } from '../../config-module/config.service';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { EditEntityService } from '../edit-entity.service';
import { getKeyProperty } from '../../utils/entity.utils';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { from, map, switchMap } from 'rxjs';
import { ENTITY_NAME_PROPERTY } from '../../../constants';
import { castValue, castValues } from '../../utils/utils';

interface AttributeWithOptValue extends Omit<EntityPropertyDto, 'value'>, Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-create-entity-form',
  imports: [ReactiveFormsModule, Button, AttributeForm],
  templateUrl: './edit-entity-form.html',
})
export class EditEntityForm {
  private readonly editEntityService = inject(EditEntityService);
  private readonly configService = inject(ConfigService);
  private readonly messageService = inject(MessageService);
  dialogRef = inject(DynamicDialogRef);

  private confirmationService = inject(ConfirmationService);

  entity = input.required<Entity>();
  loading = signal<boolean>(false);

  readonly properties: Signal<(GAttribute | EntityPropertyDto)[]> = toSignal(
    toObservable(this.entity).pipe(
      switchMap((entity) => from(this.editEntityService.getEntityProperties(entity.types[entity.types.length - 1]))),
      map((attributes) => this.mergePropArrays(this.entity().properties, attributes)),
    ),
    { initialValue: [] },
  );

  attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  propertiesForm = computed(() => this.attributeForm().propertiesForm());

  protected async clickEditButton() {
    const key = getKeyProperty(this.entity().properties);
    if (!key?.value) {
      this.messageService.add({
        severity: 'error',
        summary: `Error while editing a new entity. Please try again.`,
        closable: true,
        sticky: true,
      });
      return;
    }
    try {
      this.loading.set(true);
      await this.editEntityService.updateEntity(key.value as string, this.createPayload());
      this.confirmationService.confirm({
        message: 'The Entity was successfully created!',
        header: 'Success',
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
          label: 'Stay here',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Go to Entity',
          severity: 'primary',
        },

        accept: async () => {
          this.dialogRef.close();
        },
        reject: () => {
          this.dialogRef.close();
        },
      });
    } catch {
      this.loading.set(false);
      /* empty - Msg is displayed via Entity API */
    }
  }

  private createPayload() {
    const payload: Record<string, unknown> = {};

    Object.entries(this.propertiesForm().value).forEach(([key, value]) => {
      if (value === undefined) return;

      const prop = this.properties().find((p) => p.name === key);
      if (!prop) return;

      const dataType = this.configService.findDataType(prop.typeId);
      if (!dataType) return;

      const isArray = prop.bounds.upperBound === -1 || prop.bounds.upperBound > 1;

      if (isArray && Array.isArray(value)) {
        payload[key] = castValues(value, dataType.name);
      } else {
        payload[key] = castValue(value, dataType.name);
      }
    });

    return payload;
  }

  private mergePropArrays(props: EntityPropertyDto[], attributes: AttributeWithOptValue[]) {
    const arr: AttributeWithOptValue[] = [...props];
    let nameAttribute: AttributeWithOptValue | undefined;

    attributes.forEach((attribute) => {
      if (attribute.name === ENTITY_NAME_PROPERTY) {
        attribute.value = this.entity().label;
        nameAttribute = attribute;
      }
      const included = arr.find((prop) => attribute.name === prop.name);
      if (!included) arr.push(attribute);
    });

    if (nameAttribute) {
      const index = arr.indexOf(nameAttribute);
      if (index > -1) arr.splice(index, 1);
      arr.unshift(nameAttribute);
    }

    return arr;
  }
}
