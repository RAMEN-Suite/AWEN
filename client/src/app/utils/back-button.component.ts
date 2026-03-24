import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-back-button',
  imports: [Button],
  template: `
    <p-button [label]="label()" icon="pi pi-arrow-left" severity="secondary" [outlined]="outlined()" [text]="text()" (onClick)="goBack()" />
  `,
})
export class BackButtonComponent {
  location = inject(Location);

  label = input<string>('');
  outlined = input<boolean>(false);
  text = input<boolean>(true);

  goBack(): void {
    this.location.back();
  }
}
