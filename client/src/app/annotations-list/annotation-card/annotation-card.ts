import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Button } from 'primeng/button';
import { ConnectedNode } from '../connected-node/connected-node';
import { NodeTypes } from '../node-types/node-types';
import { AttributeList } from '../attribute-list/attribute-list';
import { UpdateAnnotation } from '../../edit-annotation/update-annotation';
import type { StatementAnnotationView } from '../annotation-list.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAnnotationConnection } from '../../create-annotation-connection/create-annotation-connection';
import { Annotation } from '../../../interfaces';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilsService } from '../../utils/utils.service';
import { EntityService } from '../../entity.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-annotation-card',
  imports: [
    Button,
    ConnectedNode,
    NodeTypes,
    AttributeList,
    UpdateAnnotation,
    NgClass,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './annotation-card.html',
})
export class AnnotationCard {
  private readonly dialogService = inject(DialogService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly utils = inject(UtilsService);
  private readonly entityService = inject(EntityService);

  public annotation = input.required<StatementAnnotationView>();

  private createAnnotationConnectionDialogRef: DynamicDialogRef<CreateAnnotationConnection> | null =
    null;

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.createAnnotationConnectionDialogRef = this.dialogService.open(
      CreateAnnotationConnection,
      {
        inputValues: {
          annotation: annotation,
        },
        header: 'Create Annotation Connection',
        styleClass: 'w-11 md:w-10 lg:w-9',
        style: {
          'min-height': '60vh',
        },
        contentStyle: {
          'padding-top': '0.5rem',
        },
        closable: true,
      },
    );
  }

  protected clickDeleteAnnotation(id: string, event?: Event) {
    this.confirmationService.confirm({
      target: event?.target ?? undefined,
      message: `Are you sure you want to delete this annotation?\n Doing so will delete the annotation and disconnect all associated nodes.`,
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete Annotation',
        severity: 'danger',
      },
      accept: async () => {
        await this.deleteAnnotation(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Annotation deleted',
        });
        await this.entityService.reloadEntity();
      },
    });
  }

  private async deleteAnnotation(id: string) {
    await this.annotationApi.delete(id);
  }

  protected copyToClipboard = this.utils.copyToClipboard;
}
