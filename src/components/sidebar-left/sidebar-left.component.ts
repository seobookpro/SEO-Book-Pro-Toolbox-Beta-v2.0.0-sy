import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  path?: string;
  icon?: string;
  children?: NavLink[];
}

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-left.component.html',
  styleUrl: './sidebar-left.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLeftComponent {
  isOpen = input.required<boolean>();
  closeSidebar = output<void>();

  openSubmenus = signal<{ [key: string]: boolean }>({ 'Core tools': true });

  navLinks: NavLink[] = [
    {
      label: 'Core tools',
      icon: 'build',
      children: [
        { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { label: 'SEO Foundations', path: '/seo-foundations', icon: 'foundation' },
        { label: 'Page Speed Analyzer', path: '/page-speed-analyzer', icon: 'speed' },
        { label: 'Live SEO Audit', path: '/live-seo-audit', icon: 'analytics' },
        { label: 'Content Analyzer', path: '/content-analyzer', icon: 'document_scanner' },
        { label: 'SEO Audit Checklist', path: '/seo-audit-checklist', icon: 'checklist' },
        { label: 'JSON-LD Generator', path: '/json-ld-generator', icon: 'data_object' },
        { label: 'Meta Tag Generator', path: '/seo-generator', icon: 'tag' },
      ]
    },
    { label: 'Use Cases', path: '/faqs', icon: 'cases' },
    { label: 'Resources', path: '/seo-glossary', icon: 'library_books' },
    { label: 'Product', path: '#', icon: 'inventory_2' },
    { label: 'Company', path: '#', icon: 'business' },
    {
      label: 'Tools & features',
      icon: 'add_circle_outline',
      children: [
        {
          label: 'Free SEO Tools',
          children: [
            { label: 'Webmaster Tools', path: '/seo-generator' },
            { label: 'Backlink Checker', path: '#' },
            { label: 'Broken Link Checker', path: '#' },
            { label: 'Website Authority Checker', path: '#' },
            { label: 'Keyword Generator', path: '#' },
            { label: 'YouTube Keyword Tool', path: '#' },
            { label: 'Amazon Keyword Tool', path: '#' },
            { label: 'Bing Keyword Tool', path: '#' },
            { label: 'SERP Checker', path: '#' },
            { label: 'SEO Toolbar', path: '#' },
            { label: 'WordPress Plugin', path: '#' },
            { label: 'Keyword Rank Checker', path: '#' },
            { label: 'Keyword Difficulty Checker', path: '#' },
            { label: 'Website Checker', path: '#' },
            { label: 'AI Writing tools', path: '#' },
          ]
        }
      ]
    },
  ];

  onLinkClick(path: string | undefined) {
    if (path && path !== '#') {
      this.closeSidebar.emit();
    }
  }
  
  toggleSubmenu(menuLabel: string) {
    this.openSubmenus.update(current => {
      const newState = { ...current };
      newState[menuLabel] = !newState[menuLabel];
      return newState;
    });
  }
}