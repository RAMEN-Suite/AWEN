import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Entity } from '../interfaces';
import { EntityApiService } from './api/entity-api.service';

/**
 * This service should be a singleton. It holds the entity, currently displayed on the detail page.
 */
@Injectable({
  providedIn: 'root',
})
export class EntityService {
  private readonly entityApi = inject(EntityApiService);

  private _entity: WritableSignal<Entity | undefined> = signal<Entity | undefined>(undefined);
  private _entityId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  public entity = this._entity.asReadonly();

  async loadNewEntity(id: string) {
    const entity = await this.entityApi.getById(id);
    this._entity.set(entity);
    this._entityId.set(id);
  }

  async reloadEntity() {
    const id = this._entityId();
    if (id) {
      const entity = await this.entityApi.getById(id);
      this._entity.set(entity);
    }
  }
}
