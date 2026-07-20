import { Component, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UpdateAnnotationService } from './update-annotation.service';
import { UpdateAnnotationForm } from './update-annotation-form/update-annotation-form';
import { Annotation } from '../../interfaces';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-update-annotation',
  providers: [DialogService, UpdateAnnotationService],
  imports: [Button],
  templateUrl: './update-annotation.html',
})
export class UpdateAnnotation {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public annotation = input.required<Annotation>();
  public label = input<string>();
  public icon = input<string>('pi pi-pencil');

  private updateAnnotationDialogRef: DynamicDialogRef<UpdateAnnotationForm> | null =
    null;

  protected clickUpdateBtn() {
    this.updateAnnotationDialogRef = this.dialogService.open(
      UpdateAnnotationForm,
      {
        inputValues: {
          annotation: this.annotation(),
        },
        header: this.transloco.translate(
          'app.shared.updateAnnotation.dialog.header',
        ),
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
