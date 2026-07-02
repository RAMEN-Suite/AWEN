import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { EntityService } from '../entity.service';
import {
  AnnotationOfEntityWithContent,
  ConnectedNodeDto,
  StatementNodeView,
} from '../../interfaces';
import { getKeyProperty } from '../utils/entity.utils';
import { ANNOTATION_LABEL_NAME, ENTITY_LABEL_NAME } from '../../constants';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { AnnotationCard } from './annotation-card/annotation-card';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { ConfigService } from '../config-module/config.service';
import { MultiSelect } from 'primeng/multiselect';

export interface StatementAnnotationView {
  annotation: AnnotationOfEntityWithContent;
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
    FormsModule,
    MultiSelect,
  ],
  templateUrl: './annotation-list.html',
  styleUrl: './annotation-list.scss',
})
export class AnnotationList {
  private readonly entityService = inject(EntityService);
  private readonly configService = inject(ConfigService);
  private previousAnnotationTypeOptions: string[] = [];

  public annotations = input.required<AnnotationOfEntityWithContent[]>();
  public entity = this.entityService.entity;

  protected readonly annotationNodeLabels =
    this.configService.getAnnotationTypes();
  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly selectedNodeLabel = signal<string>(ANNOTATION_LABEL_NAME);
  protected readonly activeAccordionPanels = signal<string[]>([]);

  protected readonly annotationTypeOptions = computed<string[]>(() => {
    return this.allAnnotationGroups().map((group) => group.type);
  });

  private readonly selectedTypeSet = computed(
    () => new Set(this.selectedTypes()),
  );

  private readonly allAnnotationGroups = computed<AnnotationGroupView[]>(() => {
    const groups = new Map<string, StatementAnnotationView[]>();

    for (const annotation of this.annotations()) {
      const view = this.toAnnotationView(annotation);
      const annotations = groups.get(annotation.type) ?? [];
      annotations.push(view);
      groups.set(annotation.type, annotations);
    }

    return Array.from(groups, ([type, annotations]) => ({
      type,
      annotations,
    })).sort((a, b) => a.type.localeCompare(b.type));
  });

  protected readonly groupedAnnotations = computed<AnnotationGroupView[]>(
    () => {
      const selectedTypeSet = this.selectedTypeSet();
      const selectedNodeLabel = this.selectedNodeLabel();

      return this.allAnnotationGroups()
        .filter((group) => selectedTypeSet.has(group.type))
        .map((group): AnnotationGroupView => {
          return {
            ...group,
            annotations: group.annotations.filter((annotation) =>
              annotation.annotation.types.includes(selectedNodeLabel),
            ),
          };
        })
        .filter((group) => group.annotations.length > 0);
    },
  );

  public constructor() {
    effect(() => {
      const options = this.annotationTypeOptions();
      untracked(() => this.syncSelectedTypes(options));
    });
  }

  private toAnnotationView(
    annotation: AnnotationOfEntityWithContent,
  ): StatementAnnotationView {
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
      directionIcon:
        node.direction === 'OUTGOING' ? 'pi-arrow-right' : 'pi-arrow-left',
    };
  }

  protected expandAll() {
    this.activeAccordionPanels.set(
      this.groupedAnnotations().map((group) => group.type),
    );
  }

  protected closeAll() {
    this.activeAccordionPanels.set([]);
  }

  protected setActiveAccordionPanels(
    value: string | number | string[] | number[] | null | undefined,
  ) {
    this.activeAccordionPanels.set(this.toStringArray(value));
  }

  protected setSelectedTypes(value: unknown) {
    this.selectedTypes.set(this.toStringArray(value));
  }

  protected setSelectedNodeLabel(value: string) {
    this.selectedNodeLabel.set(value);
  }

  private syncSelectedTypes(options: string[]) {
    const selectedTypes = this.selectedTypes();
    const previousOptions = this.previousAnnotationTypeOptions;
    this.previousAnnotationTypeOptions = options;

    if (options.length === 0) {
      if (selectedTypes.length > 0) {
        this.selectedTypes.set([]);
      }
      return;
    }

    const optionSet = new Set(options);
    const previousOptionSet = new Set(previousOptions);
    const stillAvailableSelectedTypes = selectedTypes.filter((type) =>
      optionSet.has(type),
    );
    const newTypes = options.filter((type) => !previousOptionSet.has(type));
    const nextSelectedTypes =
      previousOptions.length === 0
        ? options
        : [...stillAvailableSelectedTypes, ...newTypes];

    if (!this.arraysEqual(selectedTypes, nextSelectedTypes)) {
      this.selectedTypes.set(nextSelectedTypes);
    }
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(String);
    }

    return value === null || value === undefined ? [] : [String(value)];
  }

  private arraysEqual(a: string[], b: string[]) {
    return (
      a.length === b.length && a.every((value, index) => value === b[index])
    );
  }
}
