import { Component, inject, input } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditEntityService } from './edit-entity.service';
import { Button } from 'primeng/button';
import { Entity } from '../../interfaces';
import { EditEntityForm } from './edit-entity-form/edit-entity-form';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-edit-entity',
  imports: [Button],
  providers: [DialogService, EditEntityService],
  templateUrl: './edit-entity.html',
})
export class EditEntity {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  private editEntityDialogRef: DynamicDialogRef<EditEntityForm> | null = null;

  public entity = input<Entity>();

  private show() {
    this.editEntityDialogRef = this.dialogService.open(EditEntityForm, {
      inputValues: {
        entity: this.entity(),
      },
      header: this.transloco.translate('app.shared.editEntity.dialog.header'),
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '20vh',
      },
      closable: true,
    });
  }

  protected clickEditEntityBtn() {
    this.show();
  }
}
