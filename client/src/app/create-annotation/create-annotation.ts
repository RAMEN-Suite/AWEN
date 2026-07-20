import { Component, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAnnotationForm } from './create-annotation-form/create-annotation-form';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-create-annotation',
  providers: [DialogService],
  imports: [Button, TranslocoDirective],
  templateUrl: './create-annotation.html',
})
export class CreateAnnotation {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public entityId = input.required<string>();
  public label = input<string | undefined>();
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
        header: this.transloco.translate(
          'app.shared.createAnnotation.dialog.header',
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
