import { Component, inject } from '@angular/core';
import { CreateEntityService } from './create-entity.service';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateEntityForm } from './create-entity-form/create-entity-form';

@Component({
  selector: 'app-create-entity',
  imports: [Button],
  providers: [CreateEntityService, DialogService],
  templateUrl: './create-entity.html',
})
export class CreateEntity {
  createEntityService = inject(CreateEntityService);
  dialogService = inject(DialogService);

  ref: DynamicDialogRef<CreateEntityForm> | undefined;

  constructor() {
    //this.show();
  }

  show() {
    this.ref =
      this.dialogService.open(CreateEntityForm, {
        header: 'Select a Product',
        styleClass: 'w-11 md:w-9 lg:w-8',
        style: {
          'min-height': '20vh',
        },
      }) ?? undefined;
  }
}
