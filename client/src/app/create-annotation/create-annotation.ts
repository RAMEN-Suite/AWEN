import { Component, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAnnotationService } from './create-annotation.service';
import { CreateAnnotationForm } from './create-annotation-form/create-annotation-form';

@Component({
  selector: 'app-create-annotation',
  providers: [DialogService, CreateAnnotationService],
  imports: [Button],
  templateUrl: './create-annotation.html',
})
export class CreateAnnotation {
  private readonly dialogService = inject(DialogService);

  entityId = input.required<string>();
  label = input<string>('Add Annotation');
  icon = input<string>();

  private createAnnotationDialogRef: DynamicDialogRef<CreateAnnotationForm> | null = null;

  protected clickCreate() {
    this.createAnnotationDialogRef = this.dialogService.open(CreateAnnotationForm, {
      inputValues: {
        entityId: this.entityId(),
      },
      header: 'Create Annotation',
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '20vh',
      },
      contentStyle: {
        'padding-top': '0.5rem',
      },
      closable: true,
    });
  }
}
