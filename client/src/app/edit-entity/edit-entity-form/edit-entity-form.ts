import {
  Component,
  computed,
  inject,
  input,
  signal,
  Signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Entity, EntityPropertyDto, GAttribute } from '../../../interfaces';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { EditEntityService } from '../edit-entity.service';
import { getKeyProperty } from '../../utils/entity.utils';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { from, map, switchMap } from 'rxjs';
import { ENTITY_NAME_PROPERTY } from '../../../constants';
import { EntityService } from '../../entity.service';
import { UtilsService } from '../../utils/utils.service';

interface AttributeWithOptValue
  extends
    Omit<EntityPropertyDto, 'value'>,
    Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-create-entity-form',
  imports: [ReactiveFormsModule, AttributeForm, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './edit-entity-form.html',
})
export class EditEntityForm {
  private readonly entityService = inject(EntityService);
  private readonly editEntityService = inject(EditEntityService);
  private readonly utilService = inject(UtilsService);
  private readonly messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);

  public entity = input.required<Entity>();
  protected loading = signal<boolean>(false);

  protected readonly properties: Signal<(GAttribute | EntityPropertyDto)[]> =
    toSignal(
      toObservable(this.entity).pipe(
        switchMap((entity) =>
          from(
            this.editEntityService.getEntityProperties(
              entity.types[entity.types.length - 1],
            ),
          ),
        ),
        map((attributes) =>
          this.mergePropArrays(this.entity().properties, attributes),
        ),
      ),
      { initialValue: [] },
    );

  private attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  protected propertiesForm = computed(() =>
    this.attributeForm().propertiesForm(),
  );

  protected async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const key = getKeyProperty(this.entity().properties);
    if (!key?.value) {
      this.messageService.add({
        severity: 'error',
        summary: `Error while editing a new entity. Please try again.`,
        closable: true,
      });
      return;
    }
    try {
      this.loading.set(true);
      const payload = this.utilService.createPayload(
        this.propertiesForm().value,
        this.properties(),
      );
      await this.editEntityService.updateEntity(key.value as string, payload);
      this.messageService.add({
        severity: 'success',
        summary: `The Entity was successfully updated!`,
        closable: true,
      });
      await this.entityService.reloadEntity();
      this.dialogRef.close();
      this.loading.set(false);
    } catch {
      this.loading.set(false);
      /* empty - Msg is displayed via Entity API */
    }
  }

  private mergePropArrays(
    props: EntityPropertyDto[],
    attributes: AttributeWithOptValue[],
  ) {
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
