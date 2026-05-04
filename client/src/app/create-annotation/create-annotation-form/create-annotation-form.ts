import { Component, inject, input, signal } from '@angular/core';
import { CreateAnnotationService } from '../create-annotation.service';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

interface AnnotationCreationData extends Record<string, unknown> {
  type: string;
  value: string;
}

// Using experimental Signal Form. Cause why not
@Component({
  selector: 'app-create-annotation-form',
  imports: [FloatLabel, FormsModule, InputText, FormField, ButtonDirective],
  templateUrl: './create-annotation-form.html',
})
export class CreateAnnotationForm {
  private readonly createAnnotationService = inject(CreateAnnotationService);
  private readonly dialogRef = inject(DynamicDialogRef);

  entityId = input.required<string>();
  protected loading = signal<boolean>(false);

  private annotationModel = signal<AnnotationCreationData>({
    type: '',
    value: '',
  });

  protected createAnnotationForm = form(this.annotationModel, (schemaPath) => {
    required(schemaPath.value, { message: 'Please enter a value.' });
    required(schemaPath.type, { message: 'Please enter a type.' });
    pattern(schemaPath.type, new RegExp('^[a-z_][A-Za-z0-9_\\-]*:[a-z_][A-Za-z0-9_\\-:.]*$'), {
      message: 'The type must be a valid dictionary type.',
    });
  });

  protected async onSubmit(event: Event) {
    event.preventDefault();
    try {
      this.loading.set(true);
      const payload = this.annotationModel();
      const annotationId = await this.createAnnotationService.createAnnotationForEntity(this.entityId(), payload);
      console.log(`Created Annotation ${annotationId}`);
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }
}
