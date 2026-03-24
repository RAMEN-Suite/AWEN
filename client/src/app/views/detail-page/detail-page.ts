import { Component, computed, input } from '@angular/core';
import { Annotation, ConnectedNodeDto, Entity, NodePropertyDto } from '../../../interfaces';
import { TableModule } from 'primeng/table';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { ENTITY_LABEL_NAME } from '../../../constants';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '../../utils/back-button.component';

interface AnnotationGroup {
  type: string;
  annotations: Annotation[];
}

@Component({
  selector: 'app-detail-page',
  imports: [TableModule, Chip, Tag, RouterLink, BackButtonComponent],
  templateUrl: './detail-page.html',
})
export class DetailPage {
  entity = input.required<Entity>();
  annotations = input.required<Annotation[]>();

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
  visibleProperties(properties: NodePropertyDto[]): NodePropertyDto[] {
    return properties.filter((p) => !p.isKey && p.value !== '');
  }

  keyProperty(properties: NodePropertyDto[]): NodePropertyDto | undefined {
    return properties.find((p) => p.isKey);
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
