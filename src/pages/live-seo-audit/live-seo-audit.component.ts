import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuditResult {
  title: {
    text: string;
    length: number;
    status: 'ok' | 'missing' | 'too_long' | 'too_short';
    recommendation: string;
  };
  description: {
    text: string;
    length: number;
    status: 'ok' | 'missing' | 'too_long' | 'too_short';
    recommendation: string;
  };
  h1: {
    text: string;
    count: number;
    status: 'ok' | 'missing' | 'multiple';
    recommendation: string;
  };
  images: {
    count: number;
    missingAlt: number;
    status: 'ok' | 'improvement_needed';
    recommendation: string;
  };
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
  auditResult = signal<AuditResult | null>(null);
  
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
      // In a real app, you might show a more elegant notification.
      alert("Please select at least one audit check.");
      return;
    }

    console.log('Analyzing URL:', this.url());
    console.log('With selected checks:', checksToRun);
    this.status.set('loading');
    this.auditResult.set(null);

    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock data
    const mockResult: AuditResult = {
      title: {
        text: 'Example Domain - A Great Title',
        length: 29,
        status: 'ok',
        recommendation: 'The title tag is a good length (between 10-60 characters).'
      },
      description: {
        text: 'This is an example meta description. It should be concise and relevant to the page content. A good length is between 50 and 160 characters.',
        length: 155,
        status: 'ok',
        recommendation: 'The meta description is a good length.'
      },
      h1: {
        text: 'Example Domain',
        count: 1,
        status: 'ok',
        recommendation: 'The page has a single H1 tag, which is great for SEO.'
      },
      images: {
        count: 5,
        missingAlt: 1,
        status: 'improvement_needed',
        recommendation: '1 out of 5 images is missing descriptive alt text. Alt text helps search engines understand image content and improves accessibility.'
      }
    };
    
    this.auditResult.set(mockResult);
    this.status.set('success');
  }
  
  reset() {
    this.url.set('');
    this.status.set('idle');
    this.auditResult.set(null);
  }
  
  getStatusClass(status: 'ok' | 'missing' | 'too_long' | 'too_short' | 'multiple' | 'improvement_needed') {
    switch(status) {
      case 'ok':
        return { icon: 'check_circle', color: 'text-green-500' };
      case 'improvement_needed':
        return { icon: 'warning', color: 'text-yellow-500' };
      default:
        return { icon: 'cancel', color: 'text-red-500' };
    }
  }
}
