import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarLeftComponent } from './components/sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from './components/sidebar-right/sidebar-right.component';
import { ThemeService } from './services/theme.service';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import { SEO_BOOK_PRO_LOGO_BASE64 } from './assets/logo';

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
    BreadcrumbComponent
  ],
})
export class AppComponent {
  themeService = inject(ThemeService);
  // Inject to initialize the service and its router event subscription
  private breadcrumbService = inject(BreadcrumbService);

  logo = SEO_BOOK_PRO_LOGO_BASE64;
  leftSidebarOpen = signal(false);
  rightSidebarOpen = signal(false);
  
  // Expose theme signals to the template
  showHeader = this.themeService.showHeader;
  showFooter = this.themeService.showFooter;

  toggleLeftSidebar() {
    this.leftSidebarOpen.update(value => !value);
  }

  toggleRightSidebar() {
    this.rightSidebarOpen.update(value => !value);
  }
  
  closeSidebars() {
    this.leftSidebarOpen.set(false);
    this.rightSidebarOpen.set(false);
  }
}