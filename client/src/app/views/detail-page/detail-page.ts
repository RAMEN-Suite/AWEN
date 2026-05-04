import { Component, computed, inject, input, OnInit } from '@angular/core';
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
    }
  `,
})
export class DetailPage implements OnInit {
  private readonly entityService = inject(EntityService);

  entityId = input.required<string>();
  annotations = input.required<Annotation[]>();

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

  async ngOnInit(): Promise<void> {
    await this.entityService.loadNewEntity(this.entityId());
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

  protected readonly Array = Array;
}
