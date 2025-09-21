import { Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarLeftComponent } from './components/sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from './components/sidebar-right/sidebar-right.component';
import { ThemeService } from './services/theme.service';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import { AuditLogConsoleComponent } from './components/audit-log-console/audit-log-console.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink,
    SidebarLeftComponent, 
    SidebarRightComponent,
    BreadcrumbComponent,
    AuditLogConsoleComponent
  ],
})
export class AppComponent {
  private platformId = inject(PLATFORM_ID);
  themeService = inject(ThemeService);
  // Inject to initialize the service and its router event subscription
  private breadcrumbService = inject(BreadcrumbService);

  leftSidebarOpen = signal(false);
  rightSidebarOpen = signal(false);
  auditLogOpen = signal(false);
  
  // Expose theme signals to the template
  showHeader = this.themeService.showHeader;
  showFooter = this.themeService.showFooter;

  constructor() {
    afterNextRender(() => {
        if (isPlatformBrowser(this.platformId)) {
            // Open sidebar by default on larger screens
            this.leftSidebarOpen.set(window.innerWidth >= 1024);
        }
    });
  }

  toggleLeftSidebar() {
    this.leftSidebarOpen.update(value => !value);
  }

  toggleRightSidebar() {
    this.rightSidebarOpen.update(value => !value);
  }
  
  toggleAuditLog() {
    this.auditLogOpen.update(value => !value);
  }

  closeSidebars() {
    this.leftSidebarOpen.set(false);
    this.rightSidebarOpen.set(false);
  }
}