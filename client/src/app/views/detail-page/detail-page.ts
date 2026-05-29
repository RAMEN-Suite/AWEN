import { Component, effect, inject, input, OnDestroy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Chip } from 'primeng/chip';
import { DeleteEntity } from '../../delete-entity/delete-entity';
import { EditEntity } from '../../edit-entity/edit-entity';
import { EntityService } from '../../entity.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CreateAnnotation } from '../../create-annotation/create-annotation';
import { DialogService } from 'primeng/dynamicdialog';
import { visibleProperties } from '../../utils/utils';
import { NodeTypes } from '../../statements/node-types/node-types';
import { Statements } from '../../statements/statements';

@Component({
  selector: 'app-detail-page',
  providers: [DialogService],
  imports: [TableModule, Chip, DeleteEntity, EditEntity, ProgressSpinner, CreateAnnotation, NodeTypes, Statements],
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
