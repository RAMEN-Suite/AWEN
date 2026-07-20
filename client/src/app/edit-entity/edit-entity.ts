import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditEntityService } from './edit-entity.service';
import { Button } from 'primeng/button';
import { Entity } from '../../interfaces';
import { EditEntityForm } from './edit-entity-form/edit-entity-form';

@Component({
  selector: 'app-edit-entity',
  imports: [Button],
  providers: [DialogService, EditEntityService],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './edit-entity.html',
})
export class EditEntity {
  private readonly dialogService = inject(DialogService);

  private editEntityDialogRef: DynamicDialogRef<EditEntityForm> | null = null;

  public entity = input<Entity>();

  private show() {
    this.editEntityDialogRef = this.dialogService.open(EditEntityForm, {
      inputValues: {
        entity: this.entity(),
      },
      header: 'Edit Entity',
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
