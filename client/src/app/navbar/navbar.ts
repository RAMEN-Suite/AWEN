import { Component, inject, OnInit } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { BackButtonComponent } from '../utils/back-button.component';
import { ActivatedRoute, isActive, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Entity } from '../../interfaces';

@Component({
  selector: 'app-navbar',
  imports: [Menubar, BackButtonComponent],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    console.log('route snapshot data:', this.activatedRoute.snapshot.data);
    console.log('route snapshot params:', this.activatedRoute.snapshot.params);
    this.activatedRoute.data.subscribe(({ entity }) => {
      console.log(entity);
    });
  }

  entity = toSignal<Entity | undefined>(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.routerState.root.firstChild?.snapshot.data?.['entity']),
    ),
  );

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
