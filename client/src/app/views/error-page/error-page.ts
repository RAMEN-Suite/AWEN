import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-error-page',
  imports: [Button, RouterLink],
  styleUrl: './error-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './error-page.html',
})
export class ErrorPage {
  private activeRoute: ActivatedRoute = inject(ActivatedRoute);

  protected status = this.activeRoute.snapshot.paramMap.get('status');
}
