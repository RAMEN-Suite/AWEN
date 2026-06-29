import { Component, computed, inject, input } from '@angular/core';
import { EntityService } from '../entity.service';
import { Annotation, ConnectedNodeDto, StatementNodeView } from '../../interfaces';
import { getKeyProperty } from '../utils/entity.utils';
import { ENTITY_LABEL_NAME } from '../../constants';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { AnnotationCard } from './annotation-card/annotation-card';

export interface StatementAnnotationView {
  annotation: Annotation;
  id: string | null;
  nodes: StatementNodeView[];
}

interface AnnotationGroupView {
  type: string;
  annotations: StatementAnnotationView[];
}

@Component({
  selector: 'app-annotations-list',
  imports: [Accordion, AccordionPanel, AccordionContent, AccordionHeader, Chip, AnnotationCard],
  templateUrl: './annotation-list.html',
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
export class AnnotationList {
  private readonly entityService = inject(EntityService);

  annotations = input.required<Annotation[]>();
  entity = this.entityService.entity;

  protected readonly groupedAnnotations = computed<AnnotationGroupView[]>(() => {
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

    return Array.from(groups, ([type, annotations]) => ({ type, annotations }));
  });

  private toAnnotationView(annotation: Annotation): StatementAnnotationView {
    return {
      annotation,
      id: this.propertyValueAsString(getKeyProperty(annotation.properties)?.value),
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
    const keyValue = this.propertyValueAsString(getKeyProperty(node.properties)?.value);
    const isEntity = node.types.includes(ENTITY_LABEL_NAME);

    return {
      node,
      id: keyValue,
      entityLink: isEntity && keyValue ? `/entity/${keyValue}` : null,
      directionIcon: node.direction === 'OUTGOING' ? 'pi-arrow-right' : 'pi-arrow-left',
    };
  }
}
