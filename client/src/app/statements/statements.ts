import { Component, computed, inject, input } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { UpdateAnnotation } from '../edit-annotation/update-annotation';
import { Annotation, ConnectedNodeDto } from '../../interfaces';
import { visibleProperties } from '../utils/utils';
import { RouterLink } from '@angular/router';
import { ENTITY_LABEL_NAME } from '../../constants';
import { CreateAnnotationConnection } from '../create-annotation-connection/create-annotation-connection';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AnnotationApiService } from '../api/annotation-api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getKeyProperty } from '../utils/entity.utils';
import { EntityService } from '../entity.service';
import { PropertyList } from './property-list/property-list';

interface AnnotationGroup {
  type: string;
  annotations: Annotation[];
}

@Component({
  selector: 'app-statements',
  imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, Button, Chip, Tag, UpdateAnnotation, RouterLink, PropertyList],
  templateUrl: './statements.html',
  styles: `
    :host ::ng-deep {
      // Das Panel braucht position: relative als Sticky-Boundary
      .p-accordionpanel {
        position: relative;
      }

      // Der generierte Button im Header sticky machen
      .p-accordionheader {
        position: sticky !important;
        top: 0;
        z-index: 10;
      }

      p-motion[name='p-collapsible'] {
        overflow: hidden;
      }
    }
  `,
})
export class Statements {
  private readonly entityService = inject(EntityService);
  private readonly dialogService = inject(DialogService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  annotations = input.required<Annotation[]>();

  private createAnnotationConnectionDialogRef: DynamicDialogRef<CreateAnnotationConnection> | null = null;

  groupedAnnotations = computed<AnnotationGroup[]>(() => {
    const groups = new Map<string, Annotation[]>();
    for (const annotation of this.annotations()) {
      const existing = groups.get(annotation.type) ?? [];
      groups.set(annotation.type, [...existing, annotation]);
    }
    return Array.from(groups.entries()).map(([type, annotations]) => ({
      type,
      annotations,
    }));
  });

  protected readonly visibleProperties = visibleProperties;
  protected readonly keyProperty = getKeyProperty;
  protected readonly String = String;

  protected isEntity(node: ConnectedNodeDto): boolean {
    return node.types.includes(ENTITY_LABEL_NAME);
  }

  protected entityRouterLink(node: ConnectedNodeDto): string | null {
    const key = this.keyProperty(node.properties);
    return key ? `/entity/${key.value}` : null;
  }

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.createAnnotationConnectionDialogRef = this.dialogService.open(CreateAnnotationConnection, {
      inputValues: {
        annotation: annotation,
      },
      header: 'Create Annotation Connection',
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '50vh',
      },
      contentStyle: {
        'padding-top': '0.5rem',
      },
      closable: true,
    });
  }

  protected async clickDeleteAnnotation(id: string, event: MouseEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
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
        this.messageService.add({ severity: 'success', summary: 'Annotation deleted' });
        await this.entityService.reloadEntity();
      },
    });
  }

  protected async clickDeleteAnnotationRelation(id: string, connectedNodeId: string, event: MouseEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
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

  private async deleteAnnotation(id: string) {
    await this.annotationApi.delete(id);
  }

  private async deleteAnnotationRelation(id: string, connectedNodeId: string) {
    await this.annotationApi.deleteOutgoingRelation(id, connectedNodeId);
  }
}
