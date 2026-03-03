import { Component, inject, input } from '@angular/core';
import { OldEntity } from '../../interfaces';
import { Scroller } from 'primeng/scroller';
import { NgClass } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Chip } from 'primeng/chip';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-entity-list',
  imports: [Scroller, NgClass, PrimeTemplate, ProgressSpinner, Chip, RouterLink, Button, Tooltip],
  templateUrl: './entity-list.html',
})
export class EntityList {
  messageService = inject(MessageService);

  width = input<string>('200px');
  height = input<string>('400px');

  entities = input.required<OldEntity[]>();
  entitiesLoading = input.required<boolean>();

  async copyToClipboard(id: string) {
    await navigator.clipboard.writeText(id);
    this.messageService.add({
      severity: 'success',
      detail: `Copied "${id}" to clipboard.`,
    });
  }
}
