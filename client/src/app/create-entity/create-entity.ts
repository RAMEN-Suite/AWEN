import { Component, computed, inject } from '@angular/core';
import { CreateEntityService } from './create-entity.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateEntityForm } from './create-entity-form/create-entity-form';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-create-entity',
  imports: [SplitButton, TranslocoDirective],
  providers: [CreateEntityService, DialogService],
  templateUrl: './create-entity.html',
})
export class CreateEntity {
  private readonly createEntityService = inject(CreateEntityService);
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  private createEntityDialogRef: DynamicDialogRef<CreateEntityForm> | null =
    null;

  private entityTypes = this.createEntityService.getEntityTypes();

  protected btnItems = computed<MenuItem[]>(() => {
    return this.entityTypes().map((item) => {
      return {
        label: item,
        command: () => this.show(item),
      };
    });
  });

  private show(preselectedType?: string) {
    this.createEntityDialogRef = this.dialogService.open(CreateEntityForm, {
      inputValues: {
        preselectedType: preselectedType,
      },
      header: this.transloco.translate('app.shared.createEntity.dialog.header'),
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '20vh',
      },
      closable: true,
    });
  }

  protected clickCreateEntityBtn() {
    this.show();
  }
}
