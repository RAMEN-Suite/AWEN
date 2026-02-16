import { GModel } from './interfaces/g-model.interface';
import { NodeType } from './interfaces/node-type.interface';
import { RelationType } from './interfaces/relation-type.interface';
import { DataType } from './interfaces/data-type.interface';
import { Logger } from '@nestjs/common';

export class ModelRegistry {
  logger = new Logger(ModelRegistry.name);

  //TODO: Problem, da der name (z. B. PART_OF) nicht einmalig ist... what have I done
  dataTypes = new Map<string, DataType>();
  nodes = new Map<string, NodeType>();
  relations = new Map<string, RelationType>();

  private nodeNameById = new Map<string, string>(); // id -> name
  private nodeNameByQualifiedId = new Map<string, string>(); // "modelId:id" -> name

  constructor(ramen: GModel, profile: GModel) {
    this.register(ramen);
    this.register(profile);
  }

  private register(model: GModel) {
    this.logger.debug(model);
    model.classifiers.forEach((c) => {
      if (c.kind === 'GNode') {
        this.nodes.set(c.name, {
          id: this.formatId(c.id, model.id),
          name: c.name,
          superTypes: c.superTypes || [],
          attributes: c.attributes || [],
        });
        this.nodeNameById.set(c.id, c.name);
        this.nodeNameByQualifiedId.set(this.formatId(c.id, model.id), c.name);
      } else if (c.kind === 'GDataType') {
        this.dataTypes.set(c.name, {
          id: this.formatId(c.id, model.id),
          name: c.name,
        });
      }
    });

    model.relations.forEach((r) => {
      this.relations.set(r.name, {
        id: this.formatId(r.id, model.id),
        superTypes: r.superTypes || [],
        name: r.name,
        from: r.from,
        to: r.to,
      });
    });
  }

  getSuperNodes(name: string) {
    const node = this.getNodeType(name);
    if (!node) return undefined;

    return Array.from(this.nodes.values()).filter((n) =>
      node.superTypes.includes(n.id),
    );
  }

  getNodeType(name: string) {
    return this.nodes.get(name);
  }

  hasNodeType(name: string) {
    return this.nodes.has(name);
  }

  getRelationTypesByName(name: string): RelationType[] {
    this.logger.debug(Array.from(this.relations.values()));
    return Array.from(this.relations.values()).filter((r) => r.name === name);
  }

  resolveNodeNameFromRef(ref: string): string | undefined {
    if (ref.includes(':')) {
      return this.nodeNameByQualifiedId.get(ref);
    }
    return this.nodeNameById.get(ref) ?? undefined;
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

      const node = this.nodes.get(cur);
      if (!node) continue;

      for (const stRef of node.superTypes ?? []) {
        const stName = this.resolveNodeNameFromRef(stRef);
        if (!stName) continue;
        if (stName === baseName) return true;
        stack.push(stName);
      }
    }
    return false;
  }

  getNodeKeyField(typeName: string): string | undefined {
    const visited = new Set<string>();
    const stack = [typeName];

    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);

      const node = this.nodes.get(cur);
      if (!node) continue;

      const key = node.attributes.find((a) => a.isKey)?.name;
      if (key) return key;

      for (const stRef of node.superTypes ?? []) {
        const stName = this.resolveNodeNameFromRef(stRef);
        if (stName) stack.push(stName);
      }
    }
    return undefined;
  }

  /** Alle Subtypen (z.B. Collection o. Entity */
  getTypes(name: string): string[] {
    return Array.from(this.nodes.keys()).filter((n) =>
      this.isSubtypeOf(n, name),
    );
  }

  /**
   * Leitet Collection-Chains aus Profil-Relations ab:
   * - betrachtet nur PART_OF-Relationen, deren from/to beide Collection-Subtypen sind
   * - baut daraus Parent->Children Graph und liefert Root->Leaf Chains
   *
   * Ergebnis z.B.: [ ["Department","Volume","Regesta"], ... ]
   */
  getCollectionChains(): string[][] {
    const partOfRelations = this.getRelationTypesByName('PART_OF');
    this.logger.debug(partOfRelations);
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
}
