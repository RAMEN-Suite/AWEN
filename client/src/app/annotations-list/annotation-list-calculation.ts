import {
  COLLECTION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../../constants';
import type {
  AnnotationOfEntityWithContent,
  ConnectedNodeDto,
  Direction,
  NodePropertyDto,
  StatementNodeView,
} from '../../interfaces';
import type {
  AnnotationGroupView,
  StatementAnnotationView,
} from './annotation-list.model';

export interface AnnotationListCalculationRequest {
  annotations: AnnotationOfEntityWithContent[];
  annotationDirection: Direction;
  selectedNodeLabel: string;
  camiAvailable: boolean;
}

export function calculateGroupedAnnotations({
  annotations,
  annotationDirection,
  selectedNodeLabel,
  camiAvailable,
}: AnnotationListCalculationRequest): AnnotationGroupView[] {
  const groups = new Map<string, StatementAnnotationView[]>();

  for (const annotation of annotations) {
    if (
      annotation.direction !== annotationDirection ||
      !annotation.types.includes(selectedNodeLabel)
    ) {
      continue;
    }

    const groupAnnotations = groups.get(annotation.type) ?? [];
    groupAnnotations.push(toAnnotationView(annotation, camiAvailable));
    groups.set(annotation.type, groupAnnotations);
  }

  return Array.from(groups, ([type, groupAnnotations]) => ({
    type,
    annotations: groupAnnotations,
  })).sort((a, b) => a.type.localeCompare(b.type));
}

function toAnnotationView(
  annotation: AnnotationOfEntityWithContent,
  camiAvailable: boolean,
): StatementAnnotationView {
  return {
    annotation,
    id: propertyValueAsString(getKeyProperty(annotation.properties)?.value),
    nodes: annotation.connectedNodes.map((node) =>
      toNodeView(node, camiAvailable),
    ),
  };
}

function propertyValueAsString(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return castUnknownToString(value);
}

function getKeyProperty(
  properties: NodePropertyDto[],
): NodePropertyDto | undefined {
  return properties.find((p) => p.isKey);
}

function castUnknownToString(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function toNodeView(
  node: ConnectedNodeDto,
  camiAvailable: boolean,
): StatementNodeView {
  const keyValue = propertyValueAsString(
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
    if (camiAvailable && node.types.includes(COLLECTION_LABEL_NAME)) {
      link = {
        router: false,
        href: `/api/cami/collections/${keyValue}`,
      };
    }
    if (camiAvailable && node.types.includes(CONTENT_LABEL_NAME)) {
      link = {
        router: false,
        href: `/api/cami/contents/${keyValue}`,
      };
    }
  }

  return {
    node,
    id: keyValue ?? '',
    link: link,
    directionIcon:
      node.direction === 'OUTGOING' ? 'pi-arrow-right' : 'pi-arrow-left',
  };
}
