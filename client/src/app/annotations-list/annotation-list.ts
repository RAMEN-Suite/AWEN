import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { EntityService } from '../entity.service';
import {
  AnnotationOfEntityWithContent,
  ConnectedNodeDto,
  Direction,
  StatementNodeView,
} from '../../interfaces';
import { getKeyProperty } from '../utils/entity.utils';
import {
  ANNOTATION_LABEL_NAME,
  COLLECTION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../../constants';
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
import { castUnknownToString } from '../utils/utils';
import { Skeleton } from 'primeng/skeleton';

export interface StatementAnnotationView {
  annotation: AnnotationOfEntityWithContent;
  id: string | null;
  nodes: StatementNodeView[];
}

interface AnnotationGroupView {
  type: string;
  annotations: StatementAnnotationView[];
}

interface AnnotationGroupViews {
  refersTo: AnnotationGroupView[];
  isReferredTo: AnnotationGroupView[];
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
    Skeleton,
  ],
  templateUrl: './annotation-list.html',
  styleUrl: './annotation-list.scss',
})
export class AnnotationList {
  private readonly entityService = inject(EntityService);
  private readonly configService = inject(ConfigService);
  public annotationDirectionOptions: {
    label: string;
    value: Direction;
    icon: string;
  }[] = [
    { label: 'refers to', value: 'OUTGOING', icon: 'pi pi-arrow-right' },
    { label: 'is referred to', value: 'INCOMING', icon: 'pi pi-arrow-left' },
  ];

  public annotations = input.required<AnnotationOfEntityWithContent[]>();
  public entity = this.entityService.entity;

  protected annotationListLoaded = signal<boolean>(true);

  protected readonly annotationNodeLabels =
    this.configService.getAnnotationTypes();
  protected readonly selectedNodeLabel = signal<string>(ANNOTATION_LABEL_NAME);
  protected readonly selectedAnnotationDirection =
    signal<Direction>('OUTGOING');
  protected readonly activeAccordionPanels = signal<string[]>([]);

  private readonly allAnnotationGroups = computed<AnnotationGroupViews>(() => {
    const refersToGroups = new Map<string, StatementAnnotationView[]>();
    const isReferredToGroups = new Map<string, StatementAnnotationView[]>();

    for (const annotation of this.annotations()) {
      const view = this.toAnnotationView(annotation);

      if (annotation.direction === 'OUTGOING') {
        const annotations = refersToGroups.get(annotation.type) ?? [];
        annotations.push(view);
        refersToGroups.set(annotation.type, annotations);
      } else {
        const annotations = isReferredToGroups.get(annotation.type) ?? [];
        annotations.push(view);
        isReferredToGroups.set(annotation.type, annotations);
      }
    }

    const refersTo = Array.from(refersToGroups, ([type, annotations]) => ({
      type,
      annotations,
    })).sort((a, b) => a.type.localeCompare(b.type));
    const isReferredTo = Array.from(
      isReferredToGroups,
      ([type, annotations]) => ({
        type,
        annotations,
      }),
    ).sort((a, b) => a.type.localeCompare(b.type));

    return {
      refersTo: refersTo,
      isReferredTo: isReferredTo,
    };
  });

  protected readonly groupedAnnotations = signal<AnnotationGroupView[]>([]);

  private readonly recalculateGroupedAnnotations = effect(() => {
    const selectedNodeLabel = this.selectedNodeLabel();
    const annotationDirection = this.selectedAnnotationDirection();
    const allGroups = this.allAnnotationGroups();

    this.annotationListLoaded.set(false);

    requestAnimationFrame(() => {
      const groups =
        annotationDirection === 'INCOMING'
          ? allGroups.isReferredTo
          : allGroups.refersTo;

      const ret = groups
        .map((group): AnnotationGroupView => ({
          ...group,
          annotations: group.annotations.filter((annotation) =>
            annotation.annotation.types.includes(selectedNodeLabel),
          ),
        }))
        .filter((group) => group.annotations.length > 0);

      this.groupedAnnotations.set(ret);
      this.annotationListLoaded.set(true);
    });
  });

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

    return castUnknownToString(value);
  }

  private toNodeView(node: ConnectedNodeDto): StatementNodeView {
    const keyValue = this.propertyValueAsString(
      getKeyProperty(node.properties)?.value,
    );

    let link: {
      router: boolean;
      href: string;
    } | null = null;

    if (keyValue) {
      if (node.types.includes(ENTITY_LABEL_NAME)) {
        link = {
          router: true,
          href: `/entity/${keyValue}`,
        };
      }
      if (
        this.configService.camiAvailable() &&
        node.types.includes(COLLECTION_LABEL_NAME)
      ) {
        link = {
          router: false,
          href: `/api/cami/collections/${keyValue}`,
        };
      }
      if (
        this.configService.camiAvailable() &&
        node.types.includes(CONTENT_LABEL_NAME)
      ) {
        link = {
          router: false,
          href: `/api/cami/contents/${keyValue}`,
        };
      }
    }

    return {
      node,
      id: keyValue,
      link: link,
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

  protected setSelectedNodeLabel(value: string) {
    this.selectedNodeLabel.set(value);
  }

  protected setSelectedDirection(value: Direction) {
    this.selectedAnnotationDirection.set(value);
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(castUnknownToString);
    }

    return value === null || value === undefined
      ? []
      : [castUnknownToString(value)];
  }

  protected skeletonGroups = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  protected skeletonWidths = this.skeletonGroups.map(() => {
    const value = Math.floor(Math.random() * 7) + 4;

    return `${value}rem`;
  });
}
