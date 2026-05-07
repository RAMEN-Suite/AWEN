import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Annotation, Entity } from '../interfaces';
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
  private _annotations: WritableSignal<Annotation[]> = signal<Annotation[]>([]);
  private _entityId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  private _loading: WritableSignal<boolean> = signal<boolean>(false);

  public entity = this._entity.asReadonly();
  public annotations = this._annotations.asReadonly();
  public loading = this._loading.asReadonly();

  async loadNewEntity(id: string) {
    this._loading.set(true);
    this.resetState();
    await this.loadAndSet(id);
    this._entityId.set(id);
    this._loading.set(false);
  }

  async reloadEntity() {
    const id = this._entityId();
    if (id) {
      await this.loadAndSet(id);
    }
  }

  private async loadAndSet(id: string) {
    const entity = await this.entityApi.getById(id);
    const annotations = await this.entityApi.getAnnotationsWithConnectionsOf(id);
    this._entity.set(entity);
    this._annotations.set(annotations);
  }

  public resetState() {
    this._entity.set(undefined);
    this._annotations.set([]);
  }
}
