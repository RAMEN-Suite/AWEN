import { Component, inject, input, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntityApiService } from '../api/entity-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-entity',
  imports: [Button],
  templateUrl: './delete-entity.html',
})
export class DeleteEntity {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private entityAPI = inject(EntityApiService);

  entityId = input.required<string>();
  protected loading = signal(false);

  protected clickDeleteBtn(event: PointerEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this Entity?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete Entity',
        severity: 'danger',
      },

      accept: async () => {
        this.loading.set(true);
        try {
          await this.deleteEntity(this.entityId());
        } finally {
          this.loading.set(false);
          await this.redirectToHome();
        }
      },
    });
  }

  private async redirectToHome() {
    await this.router.navigate(['/']);
  }

  private async deleteEntity(id: string) {
    await this.entityAPI.deleteEntity(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Entity deleted',
      detail: 'The Entity was deleted successfully',
    });
  }
}
