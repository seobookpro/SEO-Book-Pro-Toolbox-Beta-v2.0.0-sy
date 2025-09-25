import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seo-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoGeneratorComponent implements OnInit {
  private route = inject(ActivatedRoute);

  copyButtonText = signal('Copy Tags');
  shareCopyText = signal('Share Configuration');

  // Form data signals
  title = signal('Your Awesome Page Title');
  description = signal('An engaging and concise description of your page content goes here. Keep it under 160 characters for best results.');
  url = signal('https://example.com/your-page');
  ogType = signal('website');
  ogImage = signal('https://picsum.photos/1200/630');
  twitterCard = signal('summary_large_image');
  twitterSite = signal('@yourhandle');
  canonicalUrl = signal('https://example.com/your-page');
  robotsContent = signal('index, follow');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['title']) {
      this.title.set(decodeURIComponent(params['title']));
    }
    if (params['description']) {
      this.description.set(decodeURIComponent(params['description']));
    }
    if (params['canonicalUrl']) {
      const canonical = decodeURIComponent(params['canonicalUrl']);
      this.canonicalUrl.set(canonical);
      this.url.set(canonical);
    }
    if (params['ogImage']) {
      this.ogImage.set(decodeURIComponent(params['ogImage']));
    }
  }

  private shareableUrl = computed(() => {
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams({
      title: this.title(),
      description: this.description(),
      canonicalUrl: this.canonicalUrl(),
      ogImage: this.ogImage(),
    });
    return `${baseUrl}?${params.toString()}`;
  });

  copyShareUrl() {
    navigator.clipboard.writeText(this.shareableUrl()).then(() => {
      this.shareCopyText.set('Link Copied!');
      setTimeout(() => this.shareCopyText.set('Share Configuration'), 2000);
    });
  }

  generatedHtml = computed(() => {
    return `<!-- Primary Meta Tags -->
<title>${this.title()}</title>
<meta name="description" content="${this.description()}">
<link rel="canonical" href="${this.canonicalUrl()}" />
<meta name="robots" content="${this.robotsContent()}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${this.ogType()}">
<meta property="og:url" content="${this.url()}">
<meta property="og:title" content="${this.title()}">
<meta property="og:description" content="${this.description()}">
<meta property="og:image" content="${this.ogImage()}">

<!-- Twitter -->
<meta property="twitter:card" content="${this.twitterCard()}">
<meta property="twitter:url" content="${this.url()}">
<meta property="twitter:title" content="${this.title()}">
<meta property="twitter:description" content="${this.description()}">
<meta property="twitter:image" content="${this.ogImage()}">
<meta property="twitter:site" content="${this.twitterSite()}">`;
  });

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedHtml()).then(() => {
      this.copyButtonText.set('Copied!');
      setTimeout(() => this.copyButtonText.set('Copy Tags'), 2000);
    });
  }

  getDomain(pageUrl: string): string {
    try {
      // Use URL constructor to easily parse the hostname
      return new URL(pageUrl).hostname.replace('www.', '');
    } catch (e) {
      // If the URL is invalid, return a placeholder
      const match = pageUrl.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
      if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
      }
      return 'example.com';
    }
  }
}
