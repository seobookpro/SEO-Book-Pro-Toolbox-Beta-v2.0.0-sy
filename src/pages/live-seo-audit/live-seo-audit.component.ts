import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuditReportItem {
  test: string;
  extraInfo: string;
  details: string; // Using string to allow for rich HTML content
}

type AuditStatus = 'idle' | 'loading' | 'success' | 'error';

interface AuditCheck {
  id: string;
  label: string;
  category: string;
}

const AUDIT_CHECKS_DATA: AuditCheck[] = [
  // Meta & Head
  { id: 'header-status', label: 'Header Status', category: 'Meta & Head' },
  { id: 'meta-charset', label: 'Meta Charset', category: 'Meta & Head' },
  { id: 'html-lang', label: 'HTML Lang', category: 'Meta & Head' },
  { id: 'meta-viewport', label: 'Meta Viewport', category: 'Meta & Head' },
  { id: 'favicon-link', label: 'Favicon Link', category: 'Meta & Head' },
  { id: 'preconnect-google-fonts', label: 'Preconnect Google Fonts', category: 'Meta & Head' },
  { id: 'shortlink-link', label: 'Shortlink Link', category: 'Meta & Head' },
  { id: 'edituri-link', label: 'EditURI Link', category: 'Meta & Head' },
  { id: 'api-link', label: 'API Link', category: 'Meta & Head' },
  { id: 'hreflang-link', label: 'Hreflang Link', category: 'Meta & Head' },
  { id: 'rss-link', label: 'RSS Link', category: 'Meta & Head' },
  { id: 'empty-meta-tags', label: 'Empty Meta Tags', category: 'Meta & Head' },
  { id: 'meta-title', label: 'Meta Title Tag', category: 'Meta & Head' },
  { id: 'meta-description', label: 'Meta Description', category: 'Meta & Head' },
  { id: 'canonical-tag', label: 'Canonical Tag', category: 'Meta & Head' },
  { id: 'opengraph-meta', label: 'OpenGraph Meta', category: 'Meta & Head' },
  { id: 'robots-meta', label: 'Robots Meta Tag', category: 'Meta & Head' },
  
  // Content & Keywords
  { id: 'top-keywords', label: 'Top Keywords', category: 'Content & Keywords' },
  { id: 'h1', label: 'H1 Headings', category: 'Content & Keywords' },
  { id: 'h2', label: 'H2 Headings', category: 'Content & Keywords' },
  { id: 'h3', label: 'H3 Headings', category: 'Content & Keywords' },
  { id: 'h4', label: 'H4 Headings', category: 'Content & Keywords' },
  { id: 'h5', label: 'H5 Headings', category: 'Content & Keywords' },
  { id: 'h6', label: 'H6 Headings', category: 'Content & Keywords' },
  { id: 'paragraphs', label: 'Paragraphs', category: 'Content & Keywords' },
  { id: 'spans', label: 'Spans', category: 'Content & Keywords' },
  { id: 'ul-li-list', label: 'Unorered UL/LI List', category: 'Content & Keywords' },
  { id: 'image-alt', label: 'Image ALT Attributes', category: 'Content & Keywords' },
  
  // Links
  { id: 'link-profile', label: 'Link Profile', category: 'Links' },
  { id: 'internal-links', label: 'Internal Links', category: 'Links' },
  { id: 'external-links', label: 'External Links', category: 'Links' },
  { id: 'http-links', label: 'HTTP Links', category: 'Links' },
  
  // Advanced & Technical
  { id: 'js-type', label: 'JavaScript Type', category: 'Advanced & Technical' },
  { id: 'json-ld', label: 'JSON-LD Schema Markup', category: 'Advanced & Technical' },
  { id: 'technologies', label: 'Technologies Detected', category: 'Advanced & Technical' },
  { id: 'pagespeed-score', label: 'Google PageSpeed Score', category: 'Advanced & Technical' },
  { id: 'sitemap-check', label: 'XML Sitemap Index and URLs', category: 'Advanced & Technical' },
  { id: 'robots-txt-check', label: 'robots.txt Check', category: 'Advanced & Technical' },
];

@Component({
  selector: 'app-live-seo-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-seo-audit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveSeoAuditComponent {
  url = signal('');
  status = signal<AuditStatus>('idle');
  showReportModal = signal(false);
  auditReportData = signal<AuditReportItem[]>([]);

  // State for checkboxes, initialized to all selected
  selectedChecks = signal<Set<string>>(new Set(AUDIT_CHECKS_DATA.map(c => c.id)));
  
  // Accordion state
  openAccordion = signal<string | null>('Meta & Head');
  
  // Data grouped for the template
  groupedChecks: {[category: string]: AuditCheck[]} = AUDIT_CHECKS_DATA.reduce((acc, check) => {
    (acc[check.category] = acc[check.category] || []).push(check);
    return acc;
  }, {} as {[category: string]: AuditCheck[]});
  
  checkCategories = Object.keys(this.groupedChecks);

  allChecksSelected = computed(() => {
    return this.selectedChecks().size === AUDIT_CHECKS_DATA.length;
  });

  toggleCheck(checkId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedChecks.update(currentSet => {
        const newSet = new Set(currentSet);
        if (isChecked) {
            newSet.add(checkId);
        } else {
            newSet.delete(checkId);
        }
        return newSet;
    });
  }
  
  toggleAccordion(category: string) {
    this.openAccordion.update(current => (current === category ? null : category));
  }

  toggleAllChecks() {
    const shouldSelectAll = !this.allChecksSelected();
    if (shouldSelectAll) {
        this.selectedChecks.set(new Set(AUDIT_CHECKS_DATA.map(c => c.id)));
    } else {
        this.selectedChecks.set(new Set());
    }
  }

  async analyzeUrl() {
    if (!this.url().trim()) return;
    
    const checksToRun = Array.from(this.selectedChecks());
    
    if (checksToRun.length === 0) {
      alert("Please select at least one audit check.");
      return;
    }

    this.status.set('loading');
    this.auditReportData.set([]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockReportData: AuditReportItem[] = [
      {
        test: 'Header Status',
        extraInfo: 'Number of Header Status found: 1',
        details: `
          <p>Input URL: https://rankmath.com</p>
          <p>Final URL: https://rankmath.com</p>
          <p>Final Status: Fetch Failed Failed to fetch</p>
          <a href="#" class="text-orange-600 dark:text-orange-400 hover:underline mt-2 inline-block">View Response Headers</a>
        `
      },
      {
        test: 'HTML Lang',
        extraInfo: 'Number of HTML Lang found: 5',
        details: 'en-US'
      },
      {
        test: 'Meta Title Tag',
        extraInfo: 'Number of Meta Title Tag found: 49',
        details: `
          <p>📜 Title:Rank Math - Best Free WordPress SEO Tools in 2025</p>
          <p>🔢 Length: 49 characters</p>
          <p>🚫 Contains bad keywords: free, best</p>
        `
      },
      {
        test: 'Meta Description',
        extraInfo: 'Number of Meta Description found: 184',
        details: `
          <p>📄 Meta Description (MetaD):Rank Math WordPress SEO plugin will help you rank higher in search engines. DOWNLOAD for FREE this plugin today to optimize your WordPress website for higher rankings and more traffic.</p>
          <p>🔢 Length: 184 characters</p>
          <p>⚠️ Description is too long (limit: 160 characters)</p>
          <p>🚫 Contains bad keywords: free</p>
          <p>❗ Brand "Best Free WordPress SEO Tools in 2025" not found in the Meta Description (MetaD)</p>
        `
      },
      {
        test: 'H1 Headings',
        extraInfo: 'Number of H1 Headings found: 1',
        details: `
          <p>H1 1 SEO for WordPress Made Easy</p>
          <p>Status: Errors 🔴 Contains banned or harmful keywords</p>
          <br>
          <p>Total H1 tags: 1</p>
        `
      },
      {
        test: 'H2 Headings',
        extraInfo: 'Number of H2 Headings found: 7',
        details: `
          <p>✅ #1: Powering SEO optimization for businesses around the world (57 chars)</p>
          <p>✅ #2: What is Rank Math? (18 chars)</p>
          <p>✅ #3: Recommended By The Best SEOs On The Planet (42 chars)</p>
          <p>✅ #4: What you can do with Rank Math (30 chars)</p>
          <p>✅ #5: Take The Guesswork Out Of SEO for WordPress (43 chars)</p>
          <p>✅ #6: Your all-in-one solution for all the SEO needs (46 chars)</p>
          <p>✅ #7: Leading SEOs are Loving Rank Math! (34 chars)</p>
          <p>Total Headings: 7</p>
        `
      },
      {
        test: 'H3 Headings',
        extraInfo: 'Number of H3 Headings found: 6',
        details: `
          <p>Rank Math Integrates With Your Favorite Platforms</p>
          <p>Easy to Follow Setup Wizard</p>
          <p>Clean, & Simple User Interface</p>
        `
      }
    ];
    
    this.auditReportData.set(mockReportData);
    this.status.set('success');
  }
  
  openReportModal() {
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
  }

  reset() {
    this.url.set('');
    this.status.set('idle');
    this.auditReportData.set([]);
    this.closeReportModal();
  }

  private cleanHtmlForCsv(html: string): string {
    // A simple regex to strip HTML tags and normalize whitespace
    return html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
  }
  
  private escapeCsvField(field: string): string {
    const cleanedField = field.replace(/"/g, '""'); // Escape double quotes
    if (cleanedField.includes(',') || cleanedField.includes('\n') || cleanedField.includes('"')) {
      return `"${cleanedField}"`;
    }
    return cleanedField;
  }

  exportToCsv() {
    const reportData = this.auditReportData();
    if (reportData.length === 0) {
      console.warn('No audit data to export.');
      return;
    }

    const headers = ['Test', 'Extra Info', 'Details'];
    const csvRows = [headers.join(',')];

    reportData.forEach(item => {
      const row = [
        this.escapeCsvField(item.test),
        this.escapeCsvField(item.extraInfo),
        this.escapeCsvField(this.cleanHtmlForCsv(item.details))
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for download attribute support
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'seo-audit-report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}