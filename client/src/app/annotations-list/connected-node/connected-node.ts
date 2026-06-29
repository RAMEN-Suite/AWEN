import { booleanAttribute, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { EntityService } from '../../entity.service';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { ConnectedNodeDto, StatementNodeView } from '../../../interfaces';
import { UtilsService } from '../../utils/utils.service';
import { ANNOTATION_LABEL_NAME, ANNOTATION_TYPE_NAME, ENTITY_LABEL_NAME } from '../../../constants';
import { getLabelProperty } from '../../utils/entity.utils';
import { NodeTypes } from '../node-types/node-types';
import { Button } from 'primeng/button';
import { getProperty } from '../../utils/utils';

@Component({
  selector: 'app-connected-node',
  imports: [NodeTypes, RouterLink, Button],
  providers: [MessageService],
  templateUrl: './connected-node.html',
})
export class ConnectedNode implements OnInit {
  private readonly entityService = inject(EntityService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly utils = inject(UtilsService);

  annotationId = input.required<string>();
  node = input.required<StatementNodeView>();
  firstEntry = input(false, { transform: booleanAttribute });
  lastEntry = input(false, { transform: booleanAttribute });

  title = computed<string | undefined>(() => {
    return this.getTitle(this.node().node);
  });

  protected annotationConnectionOptions: MenuItem[] | undefined;

  ngOnInit(): void {
    this.annotationConnectionOptions = [
      {
        icon: 'pi pi-trash',
        label: 'Delete Connection',
        command: async ($event) => {
          await this.clickDeleteAnnotationRelation(this.annotationId(), this.node().id!, $event.originalEvent);
        },
      },
      {
        icon: 'pi pi-clipboard',
        label: 'Copy UUID',
        command: async () => {
          await this.utils.copyToClipboard(this.node().id!);
        },
      },
    ];
  }

  protected async navigate(entityLink: string) {
    await this.router.navigate([entityLink]);
  }

  protected async clickDeleteAnnotationRelation(id: string, connectedNodeId: string, event?: Event) {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: `Are you sure you want to delete the relation to this annotation?`,
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete Relation',
        severity: 'danger',
      },
      accept: async () => {
        await this.deleteAnnotationRelation(id, connectedNodeId);
        this.messageService.add({ severity: 'success', summary: 'Relation deleted' });
        await this.entityService.reloadEntity();
      },
    });
  }

  private async deleteAnnotationRelation(id: string, connectedNodeId: string) {
    await this.annotationApi.deleteOutgoingRelation(id, connectedNodeId);
  }

  private getTitle(node: ConnectedNodeDto) {
    if (node.types.includes(ENTITY_LABEL_NAME)) {
      return getLabelProperty(node.properties)!.value as string;
    }
    if (node.types.includes(ANNOTATION_LABEL_NAME)) {
      return getProperty(node.properties, ANNOTATION_TYPE_NAME)!.value as string;
    }
    return undefined;
  }
}
