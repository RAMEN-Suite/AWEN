import { GModel } from './interfaces/g-model.interface';
import { NodeType } from './interfaces/node-type.interface';
import { RelationType } from './interfaces/relation-type.interface';
import { DataType } from './interfaces/data-type.interface';
import { Logger, NotFoundException } from '@nestjs/common';
import { GAttribute } from './interfaces/g-attribute.interface';

export class ModelRegistry {
  logger = new Logger(ModelRegistry.name);

  private dataTypes = new Map<string, DataType>();
  private nodes = new Map<string, NodeType>();
  private relations = new Map<string, RelationType>();
  private _collectionChains!: string[][];

  private get allDataTypes(): Array<DataType> {
    return Array.from(this.dataTypes.values());
  }

  private get allNodes(): Array<NodeType> {
    return Array.from(this.nodes.values());
  }

  private get allRelations(): Array<RelationType> {
    return Array.from(this.relations.values());
  }

  get collectionChains() {
    return [...this._collectionChains];
  }

  constructor(ramen: GModel, profile: GModel) {
    this.register(ramen);
    this.register(profile);
    this._collectionChains = this.getCollectionChains();
  }

  private register(model: GModel) {
    model.classifiers.forEach((c) => {
      if (c.kind === 'GNode') {
        const formatedId = this.formatId(c.id, model.id);
        this.nodes.set(formatedId, {
          id: formatedId,
          name: c.name,
          superTypes: this.formatSuperTypes(c.superTypes) || [],
          attributes: this.mergeAttributes(c.attributes, c.superTypes) || [],
        });
      } else if (c.kind === 'GDataType') {
        const formatedId = this.formatId(c.id, model.id);
        this.dataTypes.set(formatedId, {
          id: formatedId,
          name: c.name,
        });
      }
    });

    model.relations.forEach((r) => {
      const formatedId = this.formatId(r.id, model.id);
      this.relations.set(formatedId, {
        id: formatedId,
        superTypes: this.formatSuperTypes(r.superTypes) || [],
        name: r.name,
        from: {
          ...r.from,
          nodeId: this.formatId(r.from.nodeId, model.id),
        },
        to: {
          ...r.to,
          nodeId: this.formatId(r.to.nodeId, model.id),
        },
      });
    });
  }

  getSuperNodes(name: string) {
    const node = this.getNodeType(name);
    if (!node) return undefined;

    return this.allNodes.filter((n) => node.superTypes.has(n.id));
  }

  getNodeType(name: string) {
    return this.allNodes.find((node) => node.name === name);
  }

  hasNodeType(name: string) {
    return !!this.getNodeType(name);
  }

  getRelationTypesByName(name: string): RelationType[] {
    return this.allRelations.filter((r) => r.name === name);
  }

  resolveNodeNameFromRef(ref: string): string | undefined {
    const node = this.nodes.get(ref);
    if (node) {
      return node.name;
    }
  }

  /** Transitive subtype-Prüfung via superTypes */
  isSubtypeOf(typeName: string, baseName: string): boolean {
    if (typeName === baseName) return true;

    const visited = new Set<string>();
    const stack = [typeName];

    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);

      const node = this.getNodeType(cur);
      if (!node) continue;

      for (const stRef of node.superTypes.keys() ?? []) {
        const stName = this.resolveNodeNameFromRef(stRef);
        if (!stName) continue;
        if (stName === baseName) return true;
        stack.push(stName);
      }
    }
    return false;
  }

  getNodeKeyField(typeName: string) {
    const type = this.getNodeType(typeName);

    if (!type) {
      throw new NotFoundException(`Could not find the NodeType "${typeName}"`);
    }
    const key = type.attributes.find((attribute) => attribute.isKey);
    return key?.name;
  }

  getSubNodes(name: string) {
    return this.allNodes.filter((n) => this.isSubtypeOf(n.name, name));
  }

  /** Alle Subtypen (z.B. Collection o. Entity */
  getTypes(name: string): string[] {
    return this.allNodes
      .map((n) => n.name)
      .filter((n) => this.isSubtypeOf(n, name));
  }

  getMostSpecificType(names: string[]): NodeType | undefined {
    let type: NodeType | undefined = undefined;
    for (const node of this.allNodes) {
      if (!names.includes(node.name)) {
        continue;
      }
      if (!type) {
        type = node;
        this.logger.debug('Setting ', type);
      }
      if (node.superTypes.size > type.superTypes.size) {
        type = node;
        this.logger.debug('Setting ', type);
      }
    }
    return type;
  }

  /**
   * Leitet Collection-Chains aus Profil-Relations ab:
   * - betrachtet nur PART_OF-Relationen, deren from/to beide Collection-Subtypen sind
   * - baut daraus Parent->Children Graph und liefert Root->Leaf Chains
   *
   * Ergebnis z.B.: [ ["Department","Volume","Regesta"], ... ]
   */
  private getCollectionChains(): string[][] {
    const partOfRelations = this.getRelationTypesByName('PART_OF');
    const childrenByParent = new Map<string, Set<string>>();
    const parentsByChild = new Map<string, Set<string>>();

    const ensureSet = (m: Map<string, Set<string>>, k: string) => {
      let s = m.get(k);
      if (!s) {
        s = new Set<string>();
        m.set(k, s);
      }
      return s;
    };

    for (const rel of partOfRelations) {
      const fromName = this.resolveNodeNameFromRef(rel.from.nodeId);
      const toName = this.resolveNodeNameFromRef(rel.to.nodeId);
      this.logger.debug(`${fromName} ${toName}`);
      if (!fromName || !toName) continue;

      if (!this.isSubtypeOf(fromName, 'Collection')) continue;
      if (!this.isSubtypeOf(toName, 'Collection')) continue;

      ensureSet(childrenByParent, toName).add(fromName);
      ensureSet(parentsByChild, fromName).add(toName);

      ensureSet(parentsByChild, toName);
      ensureSet(childrenByParent, fromName);
    }

    const allNodes = new Set<string>([
      ...childrenByParent.keys(),
      ...parentsByChild.keys(),
    ]);

    const roots = Array.from(allNodes).filter((n) => {
      const parents = parentsByChild.get(n);
      return !parents || parents.size === 0;
    });

    const chains: string[][] = [];
    const dfs = (path: string[]) => {
      const last = path[path.length - 1];
      const children = childrenByParent.get(last);
      if (!children || children.size === 0) {
        if (path.length >= 1) chains.push([...path]);
        return;
      }
      for (const ch of children) {
        if (path.includes(ch)) continue;
        dfs([...path, ch]);
      }
    };

    for (const r of roots) dfs([r]);

    return chains; //.filter((c) => c.length >= 2);
  }

  private formatId(id: string, modelId: string) {
    return `${modelId}:${id}`;
  }

  private formatSuperTypes(typeIds: string[]) {
    const superTypes = new Map<string, string>();
    typeIds.forEach((typeId) => {
      const node = this.nodes.get(typeId);
      if (!node) {
        return;
      }
      superTypes.set(typeId, node.name);
    });
    return superTypes;
  }

  private mergeAttributes(attributes: GAttribute[], superTypes: string[]) {
    const mergedAttributes: GAttribute[] = [...attributes.reverse()];
    superTypes.forEach((typeId) => {
      const node = this.nodes.get(typeId);
      if (node) {
        node.attributes.forEach((a) => {
          const exists = mergedAttributes.find((existingAttribute) => {
            return existingAttribute.name === a.name;
          });
          if (!exists) {
            mergedAttributes.push(a);
          }
        });
      }
    });
    return mergedAttributes.reverse();
  }
}
