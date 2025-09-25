import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-right',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-right.component.html',
  styleUrl: './sidebar-right.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarRightComponent {
  isOpen = input.required<boolean>();
  closeSidebar = output<void>();

  private themeService = inject(ThemeService);

  // Expose theme signals to the template
  theme = this.themeService.theme;
  showHeader = this.themeService.showHeader;
  showFooter = this.themeService.showFooter;

  toolLinks = [
    { path: '/page-speed-analyzer', label: 'Page Speed Analyzer', icon: 'speed' },
    { path: '/seo-audit-checklist', label: 'SEO Checklist', icon: 'checklist' },
    { path: '/json-ld-generator', label: 'JSON-LD Generator', icon: 'data_object' },
    { path: '/seo-generator', label: 'Meta Tag Generator', icon: 'tag' },
    { path: '/live-seo-audit', label: 'Live SEO Audit', icon: 'analytics' },
  ];

  resourceLinks = [
    { path: '/seo-glossary', label: 'SEO Glossary', icon: 'menu_book' },
    { path: '/faqs', label: 'FAQs', icon: 'quiz' },
    { path: '/documentation', label: 'Documentation', icon: 'description' },
    { path: '/support', label: 'Support', icon: 'support_agent' }
  ];

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(theme);
  }

  toggleHeader(): void {
    this.themeService.toggleHeader();
  }

  toggleFooter(): void {
    this.themeService.toggleFooter();
  }
  
  onLinkClick() {
    this.closeSidebar.emit();
  }
}
