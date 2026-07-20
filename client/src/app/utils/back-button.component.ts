import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Location } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-back-button',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <p-button
      [label]="label()"
      icon="pi pi-arrow-left"
      severity="secondary"
      [outlined]="outlined()"
      [text]="text()"
      (onClick)="goBack()"
    />
  `,
})
export class BackButtonComponent {
  private location = inject(Location);

  public label = input<string>('');
  public outlined = input<boolean>(false);
  public text = input<boolean>(true);

  protected goBack(): void {
    this.location.back();
  }
}
