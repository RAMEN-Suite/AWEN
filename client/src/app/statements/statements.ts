import { Component, computed, inject, input } from '@angular/core';
import { EntityService } from '../entity.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AnnotationApiService } from '../api/annotation-api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  Annotation,
  ConnectedNodeDto,
  StatementNodeView,
} from '../../interfaces';
import { CreateAnnotationConnection } from '../create-annotation-connection/create-annotation-connection';
import { getKeyProperty } from '../utils/entity.utils';
import { ENTITY_LABEL_NAME } from '../../constants';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { Button } from 'primeng/button';
import { UpdateAnnotation } from '../edit-annotation/update-annotation';
import { NodeTypes } from './node-types/node-types';
import { PropertyList } from './property-list/property-list';
import { UtilsService } from '../utils/utils.service';
import { ConnectedNode } from './connected-node/connected-node';

interface StatementAnnotationView {
  annotation: Annotation;
  id: string | null;
  nodes: StatementNodeView[];
}

interface AnnotationGroupView {
  type: string;
  annotations: StatementAnnotationView[];
}

@Component({
  selector: 'app-statements',
  imports: [
    Accordion,
    AccordionPanel,
    AccordionContent,
    AccordionHeader,
    Chip,
    Button,
    UpdateAnnotation,
    NodeTypes,
    PropertyList,
    ConnectedNode,
  ],
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
  private readonly utils = inject(UtilsService);

  annotations = input.required<Annotation[]>();
  entity = this.entityService.entity;

  private createAnnotationConnectionDialogRef: DynamicDialogRef<CreateAnnotationConnection> | null =
    null;

  protected readonly groupedAnnotations = computed<AnnotationGroupView[]>(
    () => {
      const groups = new Map<string, StatementAnnotationView[]>();

      for (const annotation of this.annotations()) {
        const view = this.toAnnotationView(annotation);
        const annotations = groups.get(annotation.type);

        if (annotations) {
          annotations.push(view);
        } else {
          groups.set(annotation.type, [view]);
        }
      }

      return Array.from(groups, ([type, annotations]) => ({
        type,
        annotations,
      }));
    },
  );

  private toAnnotationView(annotation: Annotation): StatementAnnotationView {
    return {
      annotation,
      id: this.propertyValueAsString(
        getKeyProperty(annotation.properties)?.value,
      ),
      nodes: annotation.connectedNodes.map((node) => this.toNodeView(node)),
    };
  }

  private propertyValueAsString(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return String(value);
  }

  private toNodeView(node: ConnectedNodeDto): StatementNodeView {
    const keyValue = this.propertyValueAsString(
      getKeyProperty(node.properties)?.value,
    );
    const isEntity = node.types.includes(ENTITY_LABEL_NAME);

    return {
      node,
      id: keyValue,
      entityLink: isEntity && keyValue ? `/entity/${keyValue}` : null,
      directionSeverity: node.direction === 'OUTGOING' ? 'success' : 'info',
    };
  }

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.createAnnotationConnectionDialogRef = this.dialogService.open(
      CreateAnnotationConnection,
      {
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
      },
    );
  }

  protected async clickDeleteAnnotation(id: string, event?: Event) {
    this.confirmationService.confirm({
      target: event?.target!,
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
