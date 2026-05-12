import { Component, inject, input, signal } from '@angular/core';
import { CreateAnnotationService } from '../create-annotation.service';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { disabled, form, FormField, pattern, required } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Annotation } from '../../../interfaces';
import { CreateAnnotationConnection } from '../../create-annotation-connection/create-annotation-connection';
import { ConfirmationService } from 'primeng/api';
import { AnnotationApiService } from '../../api/annotation-api.service';

interface AnnotationCreationData extends Record<string, unknown> {
  type: string;
  value: string;
}

// Using experimental Signal Form. Cause why not
@Component({
  selector: 'app-create-annotation-form',
  providers: [CreateAnnotationService],
  imports: [FloatLabel, FormsModule, InputText, FormField, ButtonDirective],
  templateUrl: './create-annotation-form.html',
})
export class CreateAnnotationForm {
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private readonly createAnnotationService = inject(CreateAnnotationService);
  private readonly dialogRef = inject(DynamicDialogRef);
  private createAnnotationConnectionDialogRef: DynamicDialogRef<CreateAnnotationConnection> | null = null;

  entityId = input.required<string>();
  protected loading = signal<boolean>(false);

  private annotationModel = signal<AnnotationCreationData>({
    type: '',
    value: '',
  });

  protected createAnnotationForm = form(this.annotationModel, (schemaPath) => {
    disabled(schemaPath, () => this.loading());
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
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Do you want to connect this annotation to an entity?`,
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
          label: 'No',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Yes',
          severity: 'primary',
        },
        accept: async () => {
          const annotation = await this.annotationApi.get(annotationId);
          console.log(`Created Annotation ${annotation}`);
          this.clickCreateAnnotationConnection(annotation);
        },
      });
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.createAnnotationConnectionDialogRef = this.dialogService.open(CreateAnnotationConnection, {
      inputValues: {
        annotation: annotation,
      },
      header: 'Create An Optional Annotation Connection',
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '50vh',
      },
      contentStyle: {
        'padding-top': '0.5rem',
      },
      closable: true,
    });
  }
}
