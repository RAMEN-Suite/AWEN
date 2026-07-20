import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-error-page',
  imports: [Button, RouterLink, TranslocoDirective],
  styleUrl: './error-page.scss',
  templateUrl: './error-page.html',
})
export class ErrorPage {
  private activeRoute: ActivatedRoute = inject(ActivatedRoute);

  protected status = this.activeRoute.snapshot.paramMap.get('status');
}
