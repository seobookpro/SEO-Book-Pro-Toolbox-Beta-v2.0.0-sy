import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, PageSpeedReport } from '../../services/gemini.service';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface HistoryItem {
  url: string;
  score: number;
  timestamp: number;
}

@Component({
  selector: 'app-page-speed-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-speed-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSpeedAnalyzerComponent implements OnInit {
  private geminiService = inject(GeminiService);
  private readonly historyStorageKey = 'seo-audit-pro-speed-history';

  // Component State
  url = signal('');
  status = signal<AnalysisStatus>('idle');
  report = signal<PageSpeedReport | null>(null);
  errorMessage = signal('');
  analysisHistory = signal<HistoryItem[]>([]);

  // Loading animation state
  loadingMessages = [
    "Warming up the analysis engines...",
    "Scanning for performance bottlenecks...",
    "Measuring Core Web Vitals...",
    "Crafting optimization strategies...",
    "Almost there, just polishing the report!"
  ];
  currentLoadingMessage = signal(this.loadingMessages[0]);
  private loadingInterval: any;

  ngOnInit(): void {
    this.loadHistoryFromLocalStorage();
  }

  async analyzeUrl() {
    const urlToAnalyze = this.url().trim();
    if (!urlToAnalyze) return;

    this.status.set('loading');
    this.report.set(null);
    this.errorMessage.set('');
    this.startLoadingMessages();

    try {
      const result = await this.geminiService.analyzePageSpeed(urlToAnalyze);
      if (result) {
        this.report.set(result);
        this.status.set('success');
        this.saveToHistory(urlToAnalyze, result.overallScore);
      } else {
        throw new Error('The analysis returned no data. Please try another URL or check the browser console for errors.');
      }
    } catch (error) {
      this.status.set('error');
      this.errorMessage.set(error instanceof Error ? error.message : 'An unknown error occurred during analysis.');
      console.error(error);
    } finally {
      this.stopLoadingMessages();
    }
  }
  
  startLoadingMessages() {
    this.currentLoadingMessage.set(this.loadingMessages[0]);
    let i = 1;
    this.loadingInterval = setInterval(() => {
        this.currentLoadingMessage.set(this.loadingMessages[i % this.loadingMessages.length]);
        i++;
    }, 2500);
  }

  stopLoadingMessages() {
    if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
    }
  }
  
  startNewAnalysis() {
    this.url.set('');
    this.status.set('idle');
    this.report.set(null);
    this.errorMessage.set('');
  }
  
  analyzeFromHistory(historyUrl: string) {
    this.url.set(historyUrl);
    this.analyzeUrl();
  }

  // --- History Management ---
  private loadHistoryFromLocalStorage() {
    if (isPlatformBrowser(document.defaultView?.window as Window)) {
      const savedHistory = localStorage.getItem(this.historyStorageKey);
      if (savedHistory) {
        try {
          this.analysisHistory.set(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse analysis history from localStorage', e);
          this.analysisHistory.set([]);
        }
      }
    }
  }

  private saveToHistory(url: string, score: number) {
    const newItem: HistoryItem = { url, score, timestamp: Date.now() };
    
    this.analysisHistory.update(currentHistory => {
      // Remove existing entry for the same URL
      const filteredHistory = currentHistory.filter(item => item.url !== url);
      // Add new item to the top and limit to 10 entries
      const updatedHistory = [newItem, ...filteredHistory].slice(0, 10);
      
      if (isPlatformBrowser(document.defaultView?.window as Window)) {
          localStorage.setItem(this.historyStorageKey, JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
  }
  
  clearHistory() {
    this.analysisHistory.set([]);
    if (isPlatformBrowser(document.defaultView?.window as Window)) {
        localStorage.removeItem(this.historyStorageKey);
    }
  }

  // --- Template Helper Functions ---
  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }
  
  getRatingBadgeClass(rating: 'good' | 'needs-improvement' | 'poor'): string {
    switch(rating) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
  
  getPriorityClass(priority: 'high' | 'medium' | 'low'): string {
    switch(priority) {
      case 'high': return 'bg-red-500 text-red-100';
      case 'medium': return 'bg-yellow-500 text-yellow-100';
      case 'low': return 'bg-blue-500 text-blue-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  }
}
