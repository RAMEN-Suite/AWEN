import { Component, computed, inject, input, Signal, signal, viewChild } from '@angular/core';
import { UpdateAnnotationService } from '../update-annotation.service';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Annotation, EntityPropertyDto, GAttribute } from '../../../interfaces';
import { getKeyProperty } from '../../utils/entity.utils';
import { MessageService } from 'primeng/api';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { from, map, switchMap } from 'rxjs';
import { ANNOTATION_TYPE_NAME, ENTITY_NAME_PROPERTY } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

interface AttributeWithOptValue extends Omit<EntityPropertyDto, 'value'>, Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-update-annotation-form',
  imports: [FormsModule, ButtonDirective, AttributeForm],
  templateUrl: './update-annotation-form.html',
})
export class UpdateAnnotationForm {
  private readonly updateAnnotationService = inject(UpdateAnnotationService);
  private readonly dialogRef = inject(DynamicDialogRef);
  private messageService = inject(MessageService);
  private readonly utilService = inject(UtilsService);

  annotation = input.required<Annotation>();
  protected loading = signal<boolean>(false);

  private annotationId: Signal<string | null> = computed(() => {
    const keyProp = getKeyProperty(this.annotation().properties);
    if (keyProp) {
      return keyProp.value as string;
    }
    return null;
  });

  readonly properties: Signal<(GAttribute | EntityPropertyDto)[]> = toSignal(
    toObservable(this.annotation).pipe(
      switchMap((annotation) => from(this.updateAnnotationService.getAnnotationProperties(annotation.types[annotation.types.length - 1]))),
      map((attributes) => this.mergePropArrays(this.annotation().properties, attributes)),
    ),
    { initialValue: [] },
  );

  attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  propertiesForm = computed(() => this.attributeForm().propertiesForm());

  private mergePropArrays(props: EntityPropertyDto[], attributes: AttributeWithOptValue[]) {
    const arr: AttributeWithOptValue[] = [...props];
    let nameAttribute: AttributeWithOptValue | undefined;

    attributes.forEach((attribute) => {
      if (attribute.name === ANNOTATION_TYPE_NAME) {
        attribute.value = this.annotation().type;
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

  protected async onSubmit(event: Event) {
    event.preventDefault();
    const annotationId = this.annotationId();
    if (!annotationId) {
      this.messageService.add({
        severity: 'danger',
        summary: 'Failed to update annotation',
        detail: 'Please reload the page and try again. If this problem is recurring notify your administrator.',
      });
      return;
    }
    try {
      this.loading.set(true);
      const payload = this.utilService.createPayload(this.propertiesForm().value, this.properties());
      await this.updateAnnotationService.update(annotationId, payload);
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }
}
