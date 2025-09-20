import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seo-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoGeneratorComponent {
  copyButtonText = signal('Copy Tags');

  // Form data signals
  title = signal('Your Awesome Page Title');
  description = signal('An engaging and concise description of your page content goes here. Keep it under 160 characters for best results.');
  url = signal('https://example.com/your-page');
  ogType = signal('website');
  ogImage = signal('https://example.com/image.jpg');
  twitterCard = signal('summary_large_image');
  twitterSite = signal('@yourhandle');
  canonicalUrl = signal('https://example.com/your-page');
  robotsContent = signal('index, follow');

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
}
