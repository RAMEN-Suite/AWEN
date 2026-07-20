import {
  Component,
  computed,
  inject,
  input,
  Signal,
  signal,
} from '@angular/core';
import { SearchEntityService } from '../search-entity.service';
import { FilterPane } from '../filter-pane/filter-pane';
import { FormsModule } from '@angular/forms';
import { EntityList } from '../entity-list/entity-list';
import { Annotation, OldEntity } from '../../interfaces';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AnnotationApiService } from '../api/annotation-api.service';
import { getKeyProperty } from '../utils/entity.utils';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { EntityService } from '../entity.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-create-annotation-connection',
  providers: [SearchEntityService],
  imports: [FilterPane, FormsModule, EntityList],
  templateUrl: './create-annotation-connection.html',
})
export class CreateAnnotationConnection {
  private readonly entityService = inject(EntityService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly searchService = inject(SearchEntityService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  private readonly dialogRef = inject(DynamicDialogRef);

  public annotation = input.required<Annotation>();

  private annotationId: Signal<string | null> = computed(() => {
    const keyProp = getKeyProperty(this.annotation().properties);
    if (keyProp) {
      return keyProp.value as string;
    }
    return null;
  });

  protected entities = this.searchService.getEntities();
  protected entitiesLoading = this.searchService.getEntitiesLoading();
  protected loadingReq = signal(false);

  protected onSelectEntity = (entity: OldEntity) => {
    const annotationId = this.annotationId();
    if (!annotationId) {
      this.messageService.add({
        severity: 'danger',
        summary: this.transloco.translate(
          'app.shared.updateAnnotationForm.errors.missingId.summary',
        ),
        detail: this.transloco.translate(
          'app.shared.updateAnnotationForm.errors.missingId.detail',
        ),
      });
      return;
    }
    this.confirmationService.confirm({
      message: this.transloco.translate(
        'app.shared.createAnnotationConnection.confirm.message',
        { label: entity.label },
      ),
      header: this.transloco.translate(
        'app.shared.createAnnotationConnection.header',
      ),
      icon: 'pi pi-info-circle',
      rejectLabel: this.transloco.translate('app.shared.actions.cancel'),
      rejectButtonProps: {
        label: this.transloco.translate('app.shared.actions.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.transloco.translate(
          'app.shared.createAnnotationConnection.create',
        ),
        severity: 'primary',
      },

      accept: async () => {
        this.loadingReq.set(true);
        try {
          await this.annotationApi.createOutgoingRelation(
            annotationId,
            entity.id,
          );
          await this.entityService.reloadEntity();
          this.dialogRef.close();
        } finally {
          this.loadingReq.set(false);
        }
      },
    });
  };
}
