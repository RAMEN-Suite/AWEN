import { Component, computed, inject, input, OnInit, Signal, signal } from '@angular/core';
import { UpdateAnnotationService } from '../update-annotation.service';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { disabled, form, FormField, pattern, required } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Annotation } from '../../../interfaces';
import { getKeyProperty } from '../../utils/entity.utils';
import { MessageService } from 'primeng/api';

interface AnnotationUpdateData extends Record<string, unknown> {
  type: string;
  value: string;
}

// Using experimental Signal Form. Cause why not
@Component({
  selector: 'app-update-annotation-form',
  imports: [FloatLabel, FormsModule, InputText, FormField, ButtonDirective],
  templateUrl: './update-annotation-form.html',
})
export class UpdateAnnotationForm implements OnInit {
  private readonly updateAnnotationService = inject(UpdateAnnotationService);
  private readonly dialogRef = inject(DynamicDialogRef);
  private messageService = inject(MessageService);

  annotation = input.required<Annotation>();
  protected loading = signal<boolean>(false);

  private annotationModel = signal<AnnotationUpdateData>({
    type: '',
    value: '',
  });

  private annotationId: Signal<string | null> = computed(() => {
    const keyProp = getKeyProperty(this.annotation().properties);
    if (keyProp) {
      return keyProp.value as string;
    }
    return null;
  });

  protected updateAnnotationForm = form(this.annotationModel, (schemaPath) => {
    disabled(schemaPath, () => this.loading());
    required(schemaPath.value, { message: 'Please enter a value.' });
    required(schemaPath.type, { message: 'Please enter a type.' });
    pattern(schemaPath.type, new RegExp('^[a-z_][A-Za-z0-9_\\-]*:[a-z_][A-Za-z0-9_\\-:.]*$'), {
      message: 'The type must be a valid dictionary type.',
    });
  });

  ngOnInit() {
    this.loading.set(true);
    const value = this.annotation().properties.find((p) => p.name === 'value');
    this.annotationModel.set({
      type: this.annotation().type,
      value: value?.value ? (value?.value as string) : '',
    });
    this.loading.set(false);
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
      const payload = this.annotationModel();
      await this.updateAnnotationService.update(annotationId, payload);
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }
}
