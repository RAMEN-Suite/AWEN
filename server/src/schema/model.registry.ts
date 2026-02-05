import { GModel } from './interfaces/g-model.interface';
import { NodeType } from './interfaces/node-type.interface';
import { RelationType } from './interfaces/relation-type.interface';
import { DataType } from './interfaces/data-type.interface';

export class ModelRegistry {
  dataTypes = new Map<string, DataType>();
  nodes = new Map<string, NodeType>();
  relations = new Map<string, RelationType>();

  constructor(ramen: GModel, profile: GModel) {
    this.register(ramen);
    this.register(profile);
  }

  private register(model: GModel) {
    model.classifiers.forEach((c) => {
      if (c.kind === 'GNode') {
        this.nodes.set(c.name, {
          id: c.id,
          name: c.name,
          superTypes: c.superTypes || [],
          attributes: c.attributes || [],
        });
      } else if (c.kind === 'GDataType') {
        this.dataTypes.set(c.name, {
          id: c.id,
          name: c.name,
        });
      }
    });

    model.relations.forEach((r) => {
      this.relations.set(r.name, {
        id: r.id,
        superTypes: r.superTypes || [],
        name: r.name,
        from: r.from,
        to: r.to,
      });
    });
  }

  getNodeType(name: string) {
    return this.nodes.get(name);
  }

  getNodeKeyField(name: string) {
    const node = this.getNodeType(name);
    if (!node) return undefined;
    return node.attributes.find((a) => a.isKey)?.name;
  }
}
