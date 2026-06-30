import { Component, computed, inject, input, signal } from '@angular/core';
import { EntityService } from '../entity.service';
import { Annotation, ConnectedNodeDto, StatementNodeView } from '../../interfaces';
import { getKeyProperty } from '../utils/entity.utils';
import { ANNOTATION_LABEL_NAME, ENTITY_LABEL_NAME } from '../../constants';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { AnnotationCard } from './annotation-card/annotation-card';
import { Button } from 'primeng/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { ConfigService } from '../config-module/config.service';

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
  imports: [
    Accordion,
    AccordionPanel,
    AccordionContent,
    AccordionHeader,
    Chip,
    AnnotationCard,
    Button,
    SelectButton,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './annotation-list.html',
  styleUrl: './annotation-list.scss',
})
export class AnnotationList {
  private readonly entityService = inject(EntityService);
  private readonly configService = inject(ConfigService);

  annotations = input.required<Annotation[]>();
  entity = this.entityService.entity;

  protected annotationNodeLabels = this.configService.getAnnotationTypes();

  protected annotationTypesOptions = computed<string[]>(() => {
    return this._groupedAnnotations().map((group) => group.type);
  });

  private readonly _groupedAnnotations = computed<AnnotationGroupView[]>(() => {
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

  protected readonly groupedAnnotations = computed<AnnotationGroupView[]>(() => {
    return this._groupedAnnotations()
      .filter((group) => {
        return this.selectedTypes().includes(group.type);
      })
      .map((group): AnnotationGroupView => {
        const newAnnotations = group.annotations.filter((annotation) => {
          return annotation.annotation.types.includes(this.selectedNodeLabel());
        });
        return {
          ...group,
          annotations: newAnnotations,
        };
      })
      .filter((group) => group.annotations.length > 0)
      .sort((a, b) => a.type.localeCompare(b.type));
  });
  protected activeAccordionPanels = signal<string[]>([]);

  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly selectedNodeLabel = signal<string>(ANNOTATION_LABEL_NAME);

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
    this.activeAccordionPanels.set(this._groupedAnnotations().map((group) => group.type));
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
