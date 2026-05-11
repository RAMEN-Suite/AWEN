import { Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
import { Annotation, ConnectedNodeDto, NodePropertyDto } from '../../../interfaces';
import { TableModule } from 'primeng/table';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { ENTITY_LABEL_NAME } from '../../../constants';
import { RouterLink } from '@angular/router';
import { DeleteEntity } from '../../delete-entity/delete-entity';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { getKeyProperty } from '../../utils/entity.utils';
import { EditEntity } from '../../edit-entity/edit-entity';
import { EntityService } from '../../entity.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { UpdateAnnotation } from '../../update-annotation/update-annotation';
import { Button } from 'primeng/button';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CreateAnnotation } from '../../create-annotation/create-annotation';

interface AnnotationGroup {
  type: string;
  annotations: Annotation[];
}

@Component({
  selector: 'app-detail-page',
  imports: [
    TableModule,
    Chip,
    Tag,
    RouterLink,
    DeleteEntity,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    EditEntity,
    ProgressSpinner,
    UpdateAnnotation,
    Button,
    CreateAnnotation,
  ],
  templateUrl: './detail-page.html',
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
        display: block;
        overflow: hidden;
      }
    }
  `,
})
export class DetailPage implements OnDestroy {
  private readonly entityService = inject(EntityService);
  private readonly annotationApi = inject(AnnotationApiService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  entityId = input.required<string>();

  annotations = this.entityService.annotations;
  entity = this.entityService.entity;

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

  constructor() {
    effect(async () => {
      const id = this.entityId(); // Signal wird getrackt
      await this.entityService.loadNewEntity(id);
    });
  }

  ngOnDestroy() {
    this.entityService.resetState();
  }

  visibleProperties(properties: NodePropertyDto[]): NodePropertyDto[] {
    return properties.filter((p) => !p.isKey && p.value !== '');
  }

  keyProperty(properties: NodePropertyDto[]): NodePropertyDto | undefined {
    return getKeyProperty(properties);
  }

  isEntity(node: ConnectedNodeDto): boolean {
    return node.types.includes(ENTITY_LABEL_NAME);
  }

  entityRouterLink(node: ConnectedNodeDto): string | null {
    const key = this.keyProperty(node.properties);
    return key ? `/entity/${key.value}` : null;
  }

  private async deleteAnnotation(id: string) {
    await this.annotationApi.delete(id);
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

  private async deleteAnnotationRelation(id: string, connectedNodeId: string) {
    await this.annotationApi.deleteOutgoingRelation(id, connectedNodeId);
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

  protected readonly Array = Array;
  protected readonly String = String;
}
