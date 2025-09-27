import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ContentAnalysisReport, ComparativeAnalysisReport } from '../../services/gemini.service';

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

  // General state
  status = signal<AnalysisStatus>('idle');
  isLoading = signal(false);
  errorMessage = signal('');

  // Settings
  showCompetitorAnalysis = signal(false);

  // Inputs
  contentText = signal('');
  contentKeyword = signal('');
  competitorUrl = signal('');
  
  // Reports
  contentReport = signal<ContentAnalysisReport | null>(null);
  comparativeReport = signal<ComparativeAnalysisReport | null>(null);

  async analyze() {
    this.status.set('loading');
    this.isLoading.set(true);
    this.contentReport.set(null);
    this.comparativeReport.set(null);
    this.errorMessage.set('');

    try {
      if (this.showCompetitorAnalysis()) {
        if (!this.competitorUrl().trim()) {
            throw new Error('Competitor URL is required for comparative analysis.');
        }
        const result = await this.geminiService.analyzeCompetitorContent(this.contentText(), this.competitorUrl(), this.contentKeyword());
        if (result) {
            this.comparativeReport.set(result);
            this.status.set('success');
        } else {
            throw new Error('The comparative analysis returned no data.');
        }
      } else {
        const result = await this.geminiService.analyzeContent(this.contentText(), this.contentKeyword());
        if (result) {
            this.contentReport.set(result);
            this.status.set('success');
        } else {
            throw new Error('The content analysis returned no data.');
        }
      }
    } catch (error) {
      this.status.set('error');
      this.errorMessage.set(error instanceof Error ? error.message : 'An unknown error occurred during analysis.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  reset() {
    this.status.set('idle');
    this.isLoading.set(false);
    this.errorMessage.set('');
    this.contentReport.set(null);
    this.comparativeReport.set(null);
    this.contentText.set('');
    this.contentKeyword.set('');
    this.competitorUrl.set('');
    this.showCompetitorAnalysis.set(false);
  }

  // --- Export and Action Methods ---

  private generatePlainTextReport(): string {
    if (this.contentReport()) {
      const report = this.contentReport()!;
      let text = `--- Content Analysis Report ---\n\n`;
      text += `Overall Score: ${report.overallScore}/100\n\n`;
      text += `Summary:\n${report.summary}\n\n`;
      text += `Readability:\n- Score: ${report.readability.score} (${report.readability.level})\n- Interpretation: ${report.readability.interpretation}\n\n`;
      text += `Sentiment:\n- Label: ${report.sentiment.label} (Score: ${report.sentiment.score.toFixed(2)})\n- Interpretation: ${report.sentiment.interpretation}\n\n`;
      text += `Keyword Analysis (Target: "${report.keywordAnalysis.targetKeyword.keyword}"):\n`;
      text += `- Count: ${report.keywordAnalysis.targetKeyword.count}\n`;
      text += `- Density: ${report.keywordAnalysis.targetKeyword.density.toFixed(2)}%\n`;
      text += `- Prominence: ${report.keywordAnalysis.targetKeyword.prominence}\n\n`;
      text += `Other Keywords:\n${report.keywordAnalysis.otherKeywords.map(kw => `- ${kw.keyword} (${kw.count})`).join('\n')}\n\n`;
      text += `Suggestions:\n${report.suggestions.map(s => `- ${s}`).join('\n')}\n`;
      return text;
    }

    if (this.comparativeReport()) {
      const report = this.comparativeReport()!;
      let text = `--- Comparative Analysis Report for "${report.keyword}" ---\n\n`;
      text += `Metric\tYour Content\tCompetitor\n`;
      text += `Readability Score\t${report.userAnalysis.readabilityScore.toFixed(1)}\t${report.competitorAnalysis.readabilityScore.toFixed(1)}\n`;
      text += `Sentiment\t${report.userAnalysis.sentimentLabel}\t${report.competitorAnalysis.sentimentLabel}\n`;
      text += `Keyword Density\t${report.userAnalysis.keywordDensity.toFixed(2)}%\t${report.competitorAnalysis.keywordDensity.toFixed(2)}%\n\n`;
      text += `Comparative Summary:\n${report.comparativeSummary}\n\n`;
      text += `Actionable Suggestions:\n${report.actionableSuggestions.map(s => `- ${s}`).join('\n')}\n`;
      return text;
    }

    return 'No report data available.';
  }

  copyReport() {
    navigator.clipboard.writeText(this.generatePlainTextReport()).then(() => {
      alert('Report copied to clipboard!');
    });
  }

  downloadTxt() {
    const text = this.generatePlainTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    this.downloadBlob(blob, 'content-analysis-report.txt');
  }

  private generateCsvReport(): string {
    if (this.contentReport()) {
      const report = this.contentReport()!;
      const rows = [
        ['Metric', 'Value', 'Details'],
        ['Overall Score', report.overallScore.toString(), ''],
        ['Readability Score', report.readability.score.toString(), report.readability.level],
        ['Sentiment Label', report.sentiment.label, `Score: ${report.sentiment.score.toFixed(2)}`],
        ['Target Keyword', report.keywordAnalysis.targetKeyword.keyword, ''],
        ['Keyword Count', report.keywordAnalysis.targetKeyword.count.toString(), ''],
        ['Keyword Density (%)', report.keywordAnalysis.targetKeyword.density.toFixed(2), ''],
      ];
      return rows.map(row => row.map(this.escapeCsvField).join(',')).join('\n');
    }

    if (this.comparativeReport()) {
      const report = this.comparativeReport()!;
       const rows = [
        ['Metric', 'Your Content', 'Competitor Content'],
        ['Readability Score', report.userAnalysis.readabilityScore.toFixed(1), report.competitorAnalysis.readabilityScore.toFixed(1)],
        ['Sentiment', report.userAnalysis.sentimentLabel, report.competitorAnalysis.sentimentLabel],
        ['Keyword Density (%)', report.userAnalysis.keywordDensity.toFixed(2), report.competitorAnalysis.keywordDensity.toFixed(2)],
      ];
       return rows.map(row => row.map(this.escapeCsvField).join(',')).join('\n');
    }
    return '';
  }

  downloadCsv() {
    const csv = this.generateCsvReport();
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, 'content-analysis-report.csv');
    }
  }

  downloadDoc() {
    const contentElement = document.getElementById('report-content-for-export');
    if (!contentElement) return;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Content Analysis Report</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + contentElement.innerHTML + footer;

    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    this.downloadBlob(blob, 'content-analysis-report.doc');
  }

  printReport() {
    window.print();
  }
  
  private escapeCsvField(field: string | number): string {
    const stringField = String(field);
    const cleanedField = stringField.replace(/"/g, '""');
    if (cleanedField.includes(',') || cleanedField.includes('\n') || cleanedField.includes('"')) {
      return `"${cleanedField}"`;
    }
    return cleanedField;
  }

  private downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Helper functions for template
  getScoreColor(score: number): string {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  }

  getSentimentClass(label: 'positive' | 'negative' | 'neutral'): string {
    switch (label) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'neutral': return 'text-gray-500';
    }
  }

  getProminenceClass(prominence: 'good' | 'low' | 'high'): string {
    switch (prominence) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  }
}
