import { inject, Injectable } from '@angular/core';
import { castValue, castValues } from './utils';
import { EntityPropertyDto, GAttribute } from '../../interfaces';
import { ConfigService } from '../config-module/config.service';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private readonly configService = inject(ConfigService);

  createPayload = (values: Partial<Record<string, unknown>>, properties: (GAttribute | EntityPropertyDto)[]) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        payload[key] = null;
        return;
      }

      const prop = properties.find((p) => p.name === key);
      if (!prop) return;

      const dataType = this.configService.findDataType(prop.typeId);
      console.log(dataType);
      if (!dataType) return;

      const isArray = prop.bounds.upperBound === -1 || prop.bounds.upperBound > 1;

      if (isArray && Array.isArray(value)) {
        if (value.length > 0) {
          payload[key] = castValues(value, dataType.name);
        } else {
          payload[key] = null;
        }
      } else {
        payload[key] = castValue(value, dataType.name);
      }
    });

    return payload;
  };
}
