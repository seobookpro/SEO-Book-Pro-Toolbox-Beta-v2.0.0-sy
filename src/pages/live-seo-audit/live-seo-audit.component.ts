import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

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
  private http = inject(HttpClient);

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

    const checksToRun = new Set(this.selectedChecks());

    if (checksToRun.size === 0) {
      alert("Please select at least one audit check.");
      return;
    }

    this.status.set('loading');
    this.auditReportData.set([]);

    const targetUrl = this.url();
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const newReportData: AuditReportItem[] = [];

    try {
      const response = await lastValueFrom(this.http.get(proxyUrl, { observe: 'response', responseType: 'text' }));

      // --- Perform checks ---
      const htmlContent = response.body;
      const parser = new DOMParser();
      const doc = htmlContent ? parser.parseFromString(htmlContent, 'text/html') : null;

      // 1. Header Status
      if (checksToRun.has('header-status')) {
        newReportData.push({
          test: 'Header Status',
          extraInfo: `Status: ${response.status} ${response.statusText}`,
          details: `
            <p><strong>Input URL:</strong> ${targetUrl}</p>
            <p><strong>Final URL (from proxy):</strong> ${response.url || 'N/A'}</p>
            <p><strong>Final Status:</strong> <span class="font-bold ${response.status >= 200 && response.status < 300 ? 'text-green-500' : 'text-red-500'}">${response.status} ${response.statusText}</span></p>
          `
        });
      }
      
      if (doc) {
        // Meta Title
        if (checksToRun.has('meta-title')) {
          const titleEl = doc.querySelector('title');
          const title = titleEl?.textContent || '';
          const titleLength = title.length;
          let details = `<p>📜 <strong>Title:</strong> ${title || 'Not found'}</p>`;
          details += `<p>🔢 <strong>Length:</strong> ${titleLength} characters</p>`;
          if (titleLength === 0) {
              details += `<p class="text-red-500">❌ Title tag is missing or empty.</p>`;
          } else if (titleLength > 60) {
              details += `<p class="text-yellow-500">⚠️ Title is too long (over 60 characters). It may be truncated in search results.</p>`;
          } else {
              details += `<p class="text-green-500">✅ Title length is good.</p>`;
          }
          newReportData.push({ test: 'Meta Title Tag', extraInfo: `${titleLength} characters`, details });
        }
        
        // Meta Description
        if (checksToRun.has('meta-description')) {
            const descEl = doc.querySelector('meta[name="description"]');
            const description = descEl?.getAttribute('content') || '';
            const descLength = description.length;
            let details = `<p>📄 <strong>Description:</strong> ${description || 'Not found'}</p>`;
            details += `<p>🔢 <strong>Length:</strong> ${descLength} characters</p>`;
            if (descLength === 0) {
                details += `<p class="text-red-500">❌ Meta description is missing or empty.</p>`;
            } else if (descLength > 160) {
                details += `<p class="text-yellow-500">⚠️ Description is too long (over 160 characters).</p>`;
            } else {
                details += `<p class="text-green-500">✅ Description length is good.</p>`;
            }
            newReportData.push({ test: 'Meta Description', extraInfo: `${descLength} characters`, details });
        }
        
        // H1 Headings
        if (checksToRun.has('h1')) {
            const h1s = doc.querySelectorAll('h1');
            let details = '';
            if (h1s.length === 0) {
                details = `<p class="text-red-500">❌ No H1 tag found. Each page should have one H1.</p>`;
            } else {
                h1s.forEach((h1, index) => {
                    details += `<p><strong>H1 #${index + 1}:</strong> ${h1.textContent}</p>`;
                });
                if (h1s.length > 1) {
                    details += `<p class="text-yellow-500">⚠️ Multiple H1 tags found (${h1s.length}). It's best practice to use only one per page.</p>`;
                } else {
                     details += `<p class="text-green-500">✅ Exactly one H1 tag found.</p>`;
                }
            }
            newReportData.push({ test: 'H1 Headings', extraInfo: `Found: ${h1s.length}`, details });
        }
        
        // Canonical Tag
        if (checksToRun.has('canonical-tag')) {
            const canonicalEl = doc.querySelector('link[rel="canonical"]');
            const canonicalHref = canonicalEl?.getAttribute('href');
            let details = '';
            if (canonicalHref) {
                details = `<p><strong>Canonical URL:</strong> <a href="${canonicalHref}" target="_blank" class="text-orange-600 dark:text-orange-400 hover:underline">${canonicalHref}</a></p>`;
                 details += `<p class="text-green-500">✅ Canonical tag is present.</p>`;
            } else {
                details = `<p class="text-red-500">❌ No canonical tag found. This can lead to duplicate content issues.</p>`;
            }
            newReportData.push({ test: 'Canonical Tag', extraInfo: canonicalHref ? 'Found' : 'Missing', details });
        }
        
        // HTML Lang
        if (checksToRun.has('html-lang')) {
            const lang = doc.documentElement.lang;
            let details = '';
            if (lang) {
                details = `<p><strong>Language attribute:</strong> ${lang}</p>`;
                details += `<p class="text-green-500">✅ HTML lang attribute is set.</p>`;
            } else {
                details = `<p class="text-yellow-500">⚠️ HTML lang attribute is not set. It's recommended for accessibility and SEO.</p>`;
            }
             newReportData.push({ test: 'HTML Lang', extraInfo: lang || 'Not set', details });
        }
        
        // Meta Charset
        if (checksToRun.has('meta-charset')) {
            const charsetEl = doc.querySelector('meta[charset]');
            const charset = charsetEl?.getAttribute('charset');
            let details = '';
            if (charset) {
                details = `<p><strong>Charset:</strong> ${charset}</p>`;
                if (charset.toLowerCase() === 'utf-8') {
                    details += `<p class="text-green-500">✅ Standard UTF-8 charset is used.</p>`;
                } else {
                    details += `<p class="text-yellow-500">⚠️ A non-standard charset is used. UTF-8 is recommended.</p>`;
                }
            } else {
                details = `<p class="text-red-500">❌ Meta charset is not defined. It's crucial for correct character rendering.</p>`;
            }
            newReportData.push({ test: 'Meta Charset', extraInfo: charset || 'Missing', details });
        }

        // Meta Viewport
        if (checksToRun.has('meta-viewport')) {
            const viewportEl = doc.querySelector('meta[name="viewport"]');
            const content = viewportEl?.getAttribute('content');
            let details = '';
            if (content) {
                details = `<p><strong>Viewport content:</strong> ${content}</p>`;
                if (content.includes('width=device-width') && content.includes('initial-scale=1')) {
                    details += `<p class="text-green-500">✅ Viewport is correctly configured for mobile responsiveness.</p>`;
                } else {
                    details += `<p class="text-red-500">❌ Viewport is not correctly configured. It should contain "width=device-width, initial-scale=1".</p>`;
                }
            } else {
                details = `<p class="text-red-500">❌ Meta viewport tag is missing, which is critical for mobile-friendliness.</p>`;
            }
            newReportData.push({ test: 'Meta Viewport', extraInfo: content ? 'Found' : 'Missing', details });
        }

        // Favicon Link
        if (checksToRun.has('favicon-link')) {
            const faviconEls = doc.querySelectorAll('link[rel*="icon"]');
            let details = '';
            if (faviconEls.length > 0) {
                faviconEls.forEach(el => {
                    details += `<p><strong>${el.getAttribute('rel')}:</strong> ${el.getAttribute('href')}</p>`;
                });
                details += `<p class="text-green-500">✅ Favicon links found.</p>`;
            } else {
                details = `<p class="text-yellow-500">⚠️ No favicon link found.</p>`;
            }
            newReportData.push({ test: 'Favicon Link', extraInfo: `Found: ${faviconEls.length}`, details });
        }

        // Preconnect Google Fonts
        if (checksToRun.has('preconnect-google-fonts')) {
            const preconnectEls = doc.querySelectorAll('link[rel="preconnect"][href*="fonts.gstatic.com"], link[rel="preconnect"][href*="fonts.googleapis.com"]');
            let details = '';
            if (preconnectEls.length > 0) {
                 details = `<p class="text-green-500">✅ Preconnect links for Google Fonts are present, which can improve font loading performance.</p>`;
            } else {
                details = `<p class="text-yellow-500">⚠️ No preconnect links for Google Fonts found. Consider adding them if using Google Fonts.</p>`;
            }
            newReportData.push({ test: 'Preconnect Google Fonts', extraInfo: preconnectEls.length > 0 ? 'Found' : 'Not Found', details });
        }
        
        // Shortlink, EditURI, API Links
        const simpleLinkChecks = [
            { id: 'shortlink-link', rel: 'shortlink', name: 'Shortlink' },
            { id: 'edituri-link', rel: 'EditURI', name: 'EditURI' },
            { id: 'api-link', rel: 'https://api.w.org/', name: 'API Link' }
        ];
        simpleLinkChecks.forEach(check => {
            if (checksToRun.has(check.id)) {
                const el = doc.querySelector(`link[rel="${check.rel}"]`);
                const href = el?.getAttribute('href');
                let details = `<p>${href ? `<strong>URL:</strong> ${href}` : `No ${check.name} link found.`}</p>`;
                if(href && check.id === 'api-link') details += `<p>This link typically indicates a WordPress website.</p>`;
                newReportData.push({ test: `${check.name} Link`, extraInfo: href ? 'Found' : 'Not Found', details });
            }
        });
        
        // Hreflang Link
        if (checksToRun.has('hreflang-link')) {
            const hreflangEls = doc.querySelectorAll('link[rel="alternate"][hreflang]');
            let details = '';
            if (hreflangEls.length > 0) {
                hreflangEls.forEach(el => {
                    details += `<p><strong>${el.getAttribute('hreflang')}:</strong> ${el.getAttribute('href')}</p>`;
                });
            } else {
                details = `<p>No hreflang tags found.</p>`;
            }
            newReportData.push({ test: 'Hreflang Link', extraInfo: `Found: ${hreflangEls.length}`, details });
        }
        
        // RSS Link
        if (checksToRun.has('rss-link')) {
            const rssEls = doc.querySelectorAll('link[rel="alternate"][type*="rss+xml"], link[rel="alternate"][type*="atom+xml"]');
            let details = '';
            if (rssEls.length > 0) {
                rssEls.forEach(el => {
                    details += `<p><strong>${el.getAttribute('title') || 'RSS Feed'}:</strong> ${el.getAttribute('href')}</p>`;
                });
            } else {
                details = `<p>No RSS or Atom feed links found.</p>`;
            }
            newReportData.push({ test: 'RSS Link', extraInfo: `Found: ${rssEls.length}`, details });
        }
        
        // Empty Meta Tags
        if (checksToRun.has('empty-meta-tags')) {
            const metaTags = doc.querySelectorAll('meta[name][content=""], meta[property][content=""]');
            let details = '';
            if (metaTags.length > 0) {
                metaTags.forEach(el => {
                    details += `<p class="text-red-500">❌ Empty content found for meta tag: <strong>${el.getAttribute('name') || el.getAttribute('property')}</strong></p>`;
                });
            } else {
                details = `<p class="text-green-500">✅ No meta tags with empty content attributes found.</p>`;
            }
            newReportData.push({ test: 'Empty Meta Tags', extraInfo: `Found: ${metaTags.length}`, details });
        }
        
        // OpenGraph Meta
        if (checksToRun.has('opengraph-meta')) {
            const ogTags = doc.querySelectorAll('meta[property^="og:"]');
            let details = '';
            if (ogTags.length > 0) {
                ogTags.forEach(el => {
                    details += `<p><strong>${el.getAttribute('property')}:</strong> ${el.getAttribute('content')}</p>`;
                });
            } else {
                details = `<p class="text-yellow-500">⚠️ No OpenGraph (og:) meta tags found. These are important for social media sharing.</p>`;
            }
            newReportData.push({ test: 'OpenGraph Meta', extraInfo: `Found: ${ogTags.length}`, details });
        }

        // Robots Meta Tag
        if (checksToRun.has('robots-meta')) {
            const robotsEl = doc.querySelector('meta[name="robots"]');
            const content = robotsEl?.getAttribute('content');
            let details = '';
            if (content) {
                details = `<p><strong>Content:</strong> ${content}</p>`;
                if (content.includes('noindex')) {
                     details += `<p class="text-red-500">❌ This page is set to "noindex" and will not be shown in search results.</p>`;
                } else {
                     details += `<p class="text-green-500">✅ Page is indexable.</p>`;
                }
            } else {
                details = `<p class="text-green-500">✅ No robots meta tag found. The default is "index, follow", which is good.</p>`;
            }
            newReportData.push({ test: 'Robots Meta Tag', extraInfo: content || 'Not Found', details });
        }
      }

      this.auditReportData.set(newReportData);
      this.status.set('success');
      this.openReportModal();

    } catch (err: any) {
      const errorMessage = `Failed to fetch from URL. Status: ${err.status} - ${err.statusText || 'Error'}. This could be due to a CORS issue not handled by the proxy, the website being down, or an invalid URL.`;
      this.auditReportData.set([{
          test: 'Audit Failed',
          extraInfo: 'Fetch Error',
          details: `<p><strong>Input URL:</strong> ${targetUrl}</p><p class="text-red-500 font-bold">${errorMessage}</p>`
      }]);
      this.status.set('success'); // Set to success to show the results page with the error report.
      this.openReportModal();
    }
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
