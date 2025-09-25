import { Injectable, signal, effect, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private osPrefersDark = signal<boolean>(false);
  
  // State Signals
  theme = signal<Theme>('system');
  darkMode = computed<boolean>(() => {
    const currentTheme = this.theme();
    if (currentTheme === 'system') {
      return this.osPrefersDark();
    }
    return currentTheme === 'dark';
  });
  showHeader = signal<boolean>(true);
  showFooter = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.osPrefersDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      this.loadSettingsFromLocalStorage();

      // Effect to save settings to localStorage whenever they change
      effect(() => {
        localStorage.setItem('seo-audit-pro-theme', JSON.stringify({
          theme: this.theme(),
          showHeader: this.showHeader(),
          showFooter: this.showFooter(),
        }));

        if (this.darkMode()) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        this.osPrefersDark.set(e.matches);
      });
    }
  }

  private loadSettingsFromLocalStorage() {
    const savedSettings = localStorage.getItem('seo-audit-pro-theme');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.theme.set(settings.theme ?? 'system');
      this.showHeader.set(settings.showHeader ?? true);
      this.showFooter.set(settings.showFooter ?? true);
    } else {
      // Set default theme to 'system' if nothing is saved
      this.theme.set('system');
    }
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
  }

  toggleHeader() {
    this.showHeader.update(value => !value);
  }

  toggleFooter() {
    this.showFooter.update(value => !value);
  }
}
