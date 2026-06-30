import { Component, computed, inject } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { BackButtonComponent } from '../utils/back-button.component';
import { isActive, Router, RouterLink } from '@angular/router';
import { EntityService } from '../entity.service';
import { CreateEntity } from '../create-entity/create-entity';
import { ButtonDirective, ButtonIcon } from 'primeng/button';

const HEADER_MAX_LENGTH = 20;

@Component({
  selector: 'app-navbar',
  imports: [
    Menubar,
    BackButtonComponent,
    RouterLink,
    CreateEntity,
    ButtonDirective,
    ButtonIcon,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  private readonly entityService = inject(EntityService);

  private entity = this.entityService.entity;
  protected entityLoading = this.entityService.loading;

  protected header = computed(() => {
    const label = this.entity()?.label;
    if (label && label.length > HEADER_MAX_LENGTH) {
      return label
        .slice(0, HEADER_MAX_LENGTH)
        .padEnd(HEADER_MAX_LENGTH + 3, '...');
    }
    return label;
  });

  protected isHomeRoute = isActive('/', this.router, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  protected items: MenuItem[] = [];
}
