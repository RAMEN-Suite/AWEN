import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAnnotationForm } from './create-annotation-form/create-annotation-form';

@Component({
  selector: 'app-create-annotation',
  providers: [DialogService],
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './create-annotation.html',
})
export class CreateAnnotation {
  private readonly dialogService = inject(DialogService);

  public entityId = input.required<string>();
  public label = input<string>('Add Annotation');
  public icon = input<string>();

  private createAnnotationDialogRef: DynamicDialogRef<CreateAnnotationForm> | null =
    null;

  protected clickCreate() {
    this.createAnnotationDialogRef = this.dialogService.open(
      CreateAnnotationForm,
      {
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
      },
    );
  }
}
