import { Component, inject, input } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditEntityService } from './edit-entity.service';
import { Button } from 'primeng/button';
import { Entity } from '../../interfaces';
import { EditEntityForm } from './edit-entity-form/edit-entity-form';

@Component({
  selector: 'app-edit-entity',
  imports: [Button],
  providers: [DialogService, EditEntityService],
  templateUrl: './edit-entity.html',
})
export class EditEntity {
  editEntityService = inject(EditEntityService);
  dialogService = inject(DialogService);

  editEntityDialogRef: DynamicDialogRef<EditEntityForm> | null = null;

  entity = input.required<Entity>();

  show() {
    this.editEntityDialogRef = this.dialogService.open(EditEntityForm, {
      inputValues: {
        entity: this.entity(),
      },
      header: 'Edit',
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
