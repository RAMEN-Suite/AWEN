import { Injectable, Logger } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';
import { RAMENError } from './RAMENError';
import { NodeType } from './interfaces/node-type.interface';
import { GAttribute } from './interfaces/g-attribute.interface';

@Injectable()
export class RamenModelService {
  logger = new Logger(RamenModelService.name);
  constructor(private schema: SchemaLoaderService) {}

  getNodeType(name: string) {
    const type = this.schema.getRegistry().getNodeType(name);
    if (!type) {
      this.logger.error(`There is no node of the type "${name}".`);
      throw new RAMENError(`There is no node of the type "${name}".`);
    }
    return type;
  }

  getSuperNodes(name: string) {
    return this.schema.getRegistry().getSuperNodes(name);
  }

  hasNodeType(name: string): boolean {
    return this.schema.getRegistry().hasNodeType(name);
  }

  getDataTypes() {
    return this.schema.getRegistry().getDataTypes();
  }

  getDataType(id: string) {
    const dataType = this.schema.getRegistry().getDataType(id);
    if (!dataType) {
      this.logger.error(`The desired datatype "${id}" does not exist.`);
      throw new RAMENError(`The desired datatype "${id}" does not exist.`);
    }
    return dataType;
  }

  getMostSpecificType(names: string[]) {
    return this.schema.getRegistry().getMostSpecificType(names);
  }

  getAttribute(nodeName: string, paramName: string) {
    const node = this.getNodeType(nodeName);
    return node?.attributes.find((attribute) => attribute.name === paramName);
  }

  getNodeKeyField(name: string) {
    const key = this.schema.getRegistry().getNodeKeyField(name);
    if (!key) {
      this.logger.error(`There is no id field for ${name} nodes.`);
      throw new RAMENError(`There is no id field for ${name} nodes.`);
    }
    return key;
  }

  getCollectionChains() {
    return this.schema.getRegistry().collectionChains;
  }

  getSubtypes(name: string) {
    return this.schema.getRegistry().getTypes(name);
  }

  validateAttributes(
    type: NodeType,
    attributes: Record<string, unknown>,
  ): [valid: boolean, message: string[]] {
    const ret: [valid: boolean, message: string[]] = [true, []];
    Object.entries(attributes).forEach(([key, val]) => {
      this.validateAttribute(type, key, val, ret);
    });
    return ret;
  }

  validateAttribute(
    type: NodeType,
    attributeKey: string,
    attributeValue: unknown,
    ret: [valid: boolean, message: string[]] = [true, []],
  ): [valid: boolean, message: string[]] {
    const attribute = type.attributes.find(
      (attribute) => attribute.name === attributeKey,
    );
    if (!attribute) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attributeKey}" is not valid for a ${type.name}`,
      );
      return ret;
    }

    const valIsString = typeof attributeValue === 'string';
    const valIsBoolean = typeof attributeValue === 'boolean';
    const valIsNumber = typeof attributeValue === 'number';

    if (valIsString) {
      this.validateStringAttribute(attribute, attributeValue, ret);
    } else if (valIsBoolean) {
      this.validateBooleanAttribute(attribute, attributeValue, ret);
    } else if (valIsNumber) {
      this.validateNumberAttribute(attribute, attributeValue, ret);
    }

    if (attribute.constraints) {
      for (const constraint of attribute.constraints) {
        if (constraint.language === 'regex') {
          const regex = new RegExp(constraint.expression);
          if (!regex.test(String(attributeValue))) {
            ret[0] = false;
            ret[1].push(
              constraint.message ??
                `Attribute "${attributeKey}" violates constraint "${constraint.name}" (code: ${constraint.code}).`,
            );
          }
        }
        // TODO
      }
    }

    return ret;
  }

  private validateBooleanAttribute(
    attribute: GAttribute,
    attributeValue: boolean,
    ret: [valid: boolean, message: string[]],
  ): [valid: boolean, message: string[]] {
    const dataType = this.getDataType(attribute.typeId);
    if (dataType.name.toLowerCase() !== 'boolean') {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" is expected to be typeof "${dataType.name}", but is "Boolean".`,
      );
      return ret;
    }
    return ret;
  }

  private validateStringAttribute(
    attribute: GAttribute,
    attributeValue: string,
    ret: [valid: boolean, message: string[]],
  ): [valid: boolean, message: string[]] {
    const dataType = this.getDataType(attribute.typeId);

    //TODO: andere cases abfangen
    if (dataType.name.toLowerCase() !== 'string') {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" is expected to be typeof "${dataType.name}", but is "String".`,
      );
      return ret;
    }

    const { lowerBound, upperBound } = attribute.bounds;

    if (attributeValue.length < lowerBound) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" requires a length of at least ${lowerBound}, but got ${attributeValue.length}.`,
      );
    }

    if (upperBound !== -1 && attributeValue.length > upperBound) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" allows a length of at most ${upperBound}, but got ${attributeValue.length}.`,
      );
    }

    return ret;
  }

  private validateNumberAttribute(
    attribute: GAttribute,
    attributeValue: number,
    ret: [valid: boolean, message: string[]],
  ): [valid: boolean, message: string[]] {
    const dataType = this.getDataType(attribute.typeId);
    if (
      dataType.name.toLowerCase() !== 'integer' &&
      dataType.name.toLowerCase() !== 'float'
    ) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" is expected to be typeof "${dataType.name}", but is "Integer" or "Float".`,
      );
      return ret;
    }
    if (
      dataType.name.toLowerCase() === 'integer' &&
      !Number.isInteger(attributeValue)
    ) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" is expected to be typeof "${dataType.name}", but is "Float".`,
      );
      return ret;
    }

    const { lowerBound, upperBound } = attribute.bounds;

    if (attributeValue < lowerBound) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" requires a value of at least ${lowerBound}, but got ${attributeValue}.`,
      );
    }

    if (upperBound !== -1 && attributeValue > upperBound) {
      ret[0] = false;
      ret[1].push(
        `Attribute "${attribute.name}" allows a value of at most ${upperBound}, but got ${attributeValue}.`,
      );
    }

    return ret;
  }
}
