import { Component, inject, input, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { NodeTypes } from '../node-types/node-types';
import { PropertyList } from '../property-list/property-list';
import { Tag } from 'primeng/tag';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { EntityService } from '../../entity.service';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { StatementNodeView } from '../../../interfaces';
import { UtilsService } from '../../utils/utils.service';
import { SplitButton } from 'primeng/splitbutton';

@Component({
  selector: 'app-connected-node',
  imports: [Button, Menu, NodeTypes, PropertyList, Tag, SplitButton],
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

  protected annotationConnectionOptions: MenuItem[] | undefined;

  ngOnInit(): void {
    this.annotationConnectionOptions = [
      {
        icon: 'pi pi-trash',
        label: 'Delete Connection',
        command: async ($event) => {
          await this.clickDeleteAnnotationRelation(
            this.annotationId(),
            this.node().id!,
            $event.originalEvent,
          );
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

  protected async clickDeleteAnnotationRelation(
    id: string,
    connectedNodeId: string,
    event?: Event,
  ) {
    this.confirmationService.confirm({
      target: event?.target!,
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
        this.messageService.add({
          severity: 'success',
          summary: 'Relation deleted',
        });
        await this.entityService.reloadEntity();
      },
    });
  }

  private async deleteAnnotationRelation(id: string, connectedNodeId: string) {
    await this.annotationApi.deleteOutgoingRelation(id, connectedNodeId);
  }
}
