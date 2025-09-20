import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // State Signals
  darkMode = signal<boolean>(false);
  showHeader = signal<boolean>(true);
  showFooter = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSettingsFromLocalStorage();

      // Effect to save settings to localStorage whenever they change
      effect(() => {
        localStorage.setItem('seo-audit-pro-theme', JSON.stringify({
          darkMode: this.darkMode(),
          showHeader: this.showHeader(),
          showFooter: this.showFooter(),
        }));

        if (this.darkMode()) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    }
  }

  private loadSettingsFromLocalStorage() {
    const savedSettings = localStorage.getItem('seo-audit-pro-theme');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.darkMode.set(settings.darkMode ?? false);
      this.showHeader.set(settings.showHeader ?? true);
      this.showFooter.set(settings.showFooter ?? true);
    } else {
      // Check for OS preference if no setting is saved
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
    }
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
  }

  toggleHeader() {
    this.showHeader.update(value => !value);
  }

  toggleFooter() {
    this.showFooter.update(value => !value);
  }
}
