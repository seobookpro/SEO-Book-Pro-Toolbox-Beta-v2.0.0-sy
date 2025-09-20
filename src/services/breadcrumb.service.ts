import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);
  breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs: Breadcrumb[] = [];
      let route = root.firstChild;

      if (route) {
        // FIX: The 'route' variable is an ActivatedRouteSnapshot, which doesn't have a 'snapshot' property. Access 'url' directly.
        const routePath = route.url.map(segment => segment.path).join('/');
        
        // Add dashboard link unless we are on the dashboard
        if (routePath !== 'dashboard' && routePath !== '') {
            breadcrumbs.push({ label: 'Dashboard', url: '/dashboard' });
        }
        
        // FIX: The 'route' variable is an ActivatedRouteSnapshot, which doesn't have a 'snapshot' property. Access 'data' directly.
        const routeData = route.data;
        if (routeData['breadcrumb']) {
             breadcrumbs.push({ label: routeData['breadcrumb'], url: `/${routePath}` });
        }
      }
      this.breadcrumbs.set(breadcrumbs);
    });
  }
}
