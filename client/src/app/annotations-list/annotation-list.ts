import { Component, computed, inject, input, signal } from '@angular/core';
import { EntityService } from '../entity.service';
import { Annotation, ConnectedNodeDto, StatementNodeView } from '../../interfaces';
import { getKeyProperty } from '../utils/entity.utils';
import { ENTITY_LABEL_NAME } from '../../constants';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { AnnotationCard } from './annotation-card/annotation-card';
import { Button } from 'primeng/button';

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
  imports: [Accordion, AccordionPanel, AccordionContent, AccordionHeader, Chip, AnnotationCard, Button],
  templateUrl: './annotation-list.html',
  styleUrl: './annotation-list.scss',
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

  protected activeAccordionPanels = signal<string[]>([]);

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

  protected expandAll() {
    this.activeAccordionPanels.set(this.groupedAnnotations().map((group) => group.type));
  }

  protected closeAll() {
    this.activeAccordionPanels.set([]);
  }

  protected setActiveAccordionPanels(value: string | number | string[] | number[] | null | undefined) {
    if (Array.isArray(value)) {
      this.activeAccordionPanels.set(value.map(String));
      return;
    }

    this.activeAccordionPanels.set(value === null || value === undefined ? [] : [String(value)]);
  }
}
