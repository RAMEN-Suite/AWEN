import { Component, computed, inject, input, Signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Entity, EntityPropertyDto, GAttribute } from '../../../interfaces';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigService } from '../../config-module/config.service';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { Router } from '@angular/router';
import { EditEntityService } from '../edit-entity.service';
import { getKeyProperty } from '../../utils/entity.utils';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { from, map, switchMap } from 'rxjs';
import { ENTITY_NAME_PROPERTY } from '../../../constants';

interface AttributeWithOptValue extends Omit<EntityPropertyDto, 'value'>, Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-create-entity-form',
  imports: [ReactiveFormsModule, Button, AttributeForm],
  templateUrl: './edit-entity-form.html',
})
export class EditEntityForm {
  private readonly editEntityService = inject(EditEntityService);
  private readonly configService = inject(ConfigService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  dialogRef = inject(DynamicDialogRef);

  private confirmationService = inject(ConfirmationService);

  entity = input.required<Entity>();

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
      const createdId = await this.editEntityService.updateEntity(key.value, this.createPayload());
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
          await this.router.navigate(['entity', createdId]);
          this.dialogRef.close();
        },
        reject: () => {
          this.dialogRef.close();
        },
      });
    } catch {
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
