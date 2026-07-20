import { Component, inject, input, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntityApiService } from '../api/entity-api.service';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

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
  private readonly transloco = inject(TranslocoService);

  public entityId = input.required<string>();
  protected loading = signal(false);

  protected clickDeleteBtn(event: PointerEvent) {
    this.confirmationService.confirm({
      target: event.target ?? undefined,
      message: this.transloco.translate(
        'app.shared.deleteEntity.confirm.message',
      ),
      header: this.transloco.translate('app.shared.common.dangerZone'),
      icon: 'pi pi-info-circle',
      rejectLabel: this.transloco.translate('app.shared.actions.cancel'),
      rejectButtonProps: {
        label: this.transloco.translate('app.shared.actions.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.transloco.translate(
          'app.shared.deleteEntity.confirm.accept',
        ),
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
      summary: this.transloco.translate(
        'app.shared.deleteEntity.success.summary',
      ),
      detail: this.transloco.translate(
        'app.shared.deleteEntity.success.detail',
      ),
    });
  }
}
