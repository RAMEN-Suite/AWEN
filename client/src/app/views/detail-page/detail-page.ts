import { Component, effect, inject, input, OnDestroy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DeleteEntity } from '../../delete-entity/delete-entity';
import { EditEntity } from '../../edit-entity/edit-entity';
import { EntityService } from '../../entity.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CreateAnnotation } from '../../create-annotation/create-annotation';
import { DialogService } from 'primeng/dynamicdialog';
import { visibleProperties } from '../../utils/utils';
import { NodeTypes } from '../../statements/node-types/node-types';
import { Statements } from '../../statements/statements';
import { PropertyList } from '../../statements/property-list/property-list';

@Component({
  selector: 'app-detail-page',
  providers: [DialogService],
  imports: [TableModule, DeleteEntity, EditEntity, ProgressSpinner, CreateAnnotation, NodeTypes, Statements, PropertyList],
  styleUrl: './detail-page.scss',
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnDestroy {
  private readonly entityService = inject(EntityService);

  entityId = input.required<string>();

  annotations = this.entityService.annotations;
  entity = this.entityService.entity;

  protected readonly visibleProperties = visibleProperties;
  protected readonly Array = Array;
  protected readonly String = String;

  protected isArrayValue(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  protected displayValue(value: unknown): string {
    return String(value ?? '');
  }

  constructor() {
    effect(async () => {
      const id = this.entityId(); // Signal wird getrackt
      await this.entityService.loadNewEntity(id);
    });
  }

  ngOnDestroy() {
    this.entityService.resetState();
  }
}
