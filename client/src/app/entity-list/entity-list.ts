import { Component, inject, input } from '@angular/core';
import { OldEntity } from '../../interfaces';
import { Scroller } from 'primeng/scroller';
import { NgClass } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Chip } from 'primeng/chip';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { UtilsService } from '../utils/utils.service';

@Component({
  selector: 'app-entity-list',
  imports: [Scroller, NgClass, PrimeTemplate, ProgressSpinner, Chip, Button, Tooltip],
  templateUrl: './entity-list.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
  `,
})
export class EntityList {
  private readonly utils = inject(UtilsService);

  width = input<string>('100%');
  height = input<string>('100%');

  entities = input.required<OldEntity[]>();
  entitiesLoading = input.required<boolean>();
  onSelect = input.required<(entity: OldEntity) => void>();

  protected selectEntity(entity: OldEntity) {
    this.onSelect()(entity);
  }
  protected copyToClipboard = this.utils.copyToClipboard;
}
