import { Component, inject } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { BackButtonComponent } from '../utils/back-button.component';
import { isActive, Router } from '@angular/router';
import { EntityService } from '../entity.service';

@Component({
  selector: 'app-navbar',
  imports: [Menubar, BackButtonComponent],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  private readonly entityService = inject(EntityService);

  entity = this.entityService.entity;

  isHomeRoute = isActive('/', this.router, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
  ];
}
