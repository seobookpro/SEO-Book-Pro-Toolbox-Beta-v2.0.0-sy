import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ContentAnalysisReport } from '../../services/gemini.service';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-content-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentAnalyzerComponent {
  private geminiService = inject(GeminiService);

  content = signal('');
  targetKeyword = signal('');
  status = signal<AnalysisStatus>('idle');
  report = signal<ContentAnalysisReport | null>(null);
  errorMessage = signal('');
  
  wordCount = computed(() => {
    const content = this.content();
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  });

  async analyzeContent() {
    if (!this.content().trim() || !this.targetKeyword().trim()) return;

    this.status.set('loading');
    this.report.set(null);
    this.errorMessage.set('');

    try {
      const result = await this.geminiService.analyzeContent(this.content(), this.targetKeyword());
      if (result) {
        this.report.set(result);
        this.status.set('success');
      } else {
        throw new Error('The analysis returned no data. The AI may have been unable to process the request.');
      }
    } catch (error) {
      this.status.set('error');
      this.errorMessage.set(error instanceof Error ? error.message : 'An unknown error occurred during analysis.');
      console.error(error);
    }
  }
  
  reset() {
    this.content.set('');
    this.targetKeyword.set('');
    this.status.set('idle');
    this.report.set(null);
    this.errorMessage.set('');
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }
  
  getProminenceClass(prominence: 'good' | 'low' | 'high'): string {
    switch(prominence) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getSentimentColor(label: 'positive' | 'negative' | 'neutral'): string {
    switch (label) {
        case 'positive': return 'text-green-500';
        case 'negative': return 'text-red-500';
        default: return 'text-blue-500';
    }
  }
}