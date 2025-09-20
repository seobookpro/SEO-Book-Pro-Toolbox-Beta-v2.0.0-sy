export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  details: string;
}

export const SEO_CHECKLIST_DATA: ChecklistItem[] = [
  // Basics & Setup
  { id: 'setup-gsc', category: 'Basics & Setup', task: 'Set up Google Search Console', details: 'Verify site ownership and submit sitemaps to monitor search performance.' },
  { id: 'setup-analytics', category: 'Basics & Setup', task: 'Set up Google Analytics', details: 'Install tracking code to monitor website traffic and user behavior.' },
  { id: 'check-manual-actions', category: 'Basics & Setup', task: 'Check for Google manual actions', details: 'Look in Google Search Console for any penalties that might affect your ranking.' },
  { id: 'define-http-https', category: 'Basics & Setup', task: 'Ensure only one version of your site is browseable', details: 'Check that http, https, www, and non-www versions all redirect to a single canonical version.' },

  // Crawling & Indexing
  { id: 'review-robots-txt', category: 'Crawling & Indexing', task: 'Review robots.txt file', details: 'Ensure you are not blocking important content from being crawled by search engines.' },
  { id: 'find-crawl-errors', category: 'Crawling & Indexing', task: 'Find and fix crawl errors', details: 'Use GSC’s Coverage report to identify and resolve crawling issues.' },
  { id: 'check-index-status', category: 'Crawling & Indexing', task: 'Check Google index status', details: 'Use the "site:" search operator (e.g., site:yourdomain.com) to see how many pages are indexed.' },
  { id: 'use-sitemap', category: 'Crawling & Indexing', task: 'Create and submit an XML sitemap', details: 'Help search engines discover all important pages on your site.' },
  { id: 'check-temp-redirects', category: 'Crawling & Indexing', task: 'Check for temporary (302) redirects', details: 'Replace temporary redirects with permanent (301) redirects for pages that have moved permanently.' },
  { id: 'fix-broken-links', category: 'Crawling & Indexing', task: 'Fix broken internal and external links', details: 'Broken links create a poor user experience and waste crawl budget.' },

  // On-Page Elements
  { id: 'optimize-titles', category: 'On-Page Elements', task: 'Optimize title tags', details: 'Ensure every page has a unique, descriptive title tag under 60 characters.' },
  { id: 'optimize-metas', category: 'On-Page Elements', task: 'Optimize meta descriptions', details: 'Write unique, compelling meta descriptions for key pages to improve CTR.' },
  { id: 'check-h1', category: 'On-Page Elements', task: 'Check for a single H1 tag', details: 'Each page should have one, and only one, H1 tag that describes the page content.' },
  { id: 'use-subheadings', category: 'On-Page Elements', task: 'Use header tags (H2-H6) correctly', details: 'Structure your content logically with subheadings to improve readability.' },
  { id: 'optimize-images', category: 'On-Page Elements', task: 'Optimize images', details: 'Compress images and use descriptive alt text for all important images.' },
  { id: 'check-structured-data', category: 'On-Page Elements', task: 'Check for structured data opportunities', details: 'Implement schema markup (like Article, Product, FAQ) to be eligible for rich snippets.' },

  // Site Architecture
  { id: 'check-site-structure', category: 'Site Architecture', task: 'Check for a logical site structure', details: 'Ensure your site is easy to navigate and important pages are not buried too deep.' },
  { id: 'use-breadcrumbs', category: 'Site Architecture', task: 'Use breadcrumbs', details: 'Help users and search engines understand the page hierarchy.' },
  { id: 'check-urls', category: 'Site Architecture', task: 'Ensure URLs are SEO-friendly', details: 'Use simple, readable URLs with keywords where appropriate.' },
  { id: 'use-canonicals', category: 'Site Architecture', task: 'Use canonical tags for duplicate content', details: 'Specify the preferred version of a page to avoid duplicate content issues.' },

  // Content
  { id: 'find-thin-content', category: 'Content', task: 'Find and improve thin content', details: 'Expand pages with little or no content to provide more value to users.' },
  { id: 'check-duplicate-content', category: 'Content', task: 'Check for internal duplicate content', details: 'Ensure you don\'t have multiple pages competing for the same keywords.' },
  { id: 'optimize-content-quality', category: 'Content', task: 'Ensure content is high-quality', details: 'Content should be well-written, informative, and meet user intent.' },

  // Mobile Friendliness
  { id: 'mobile-friendly-test', category: 'Mobile Friendliness', task: 'Run the Mobile-Friendly Test', details: 'Use Google’s test to ensure your pages are easy to use on mobile devices.' },
  { id: 'check-viewport', category: 'Mobile Friendliness', task: 'Check for viewport meta tag', details: 'Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is present.' },
  { id: 'check-font-size', category: 'Mobile Friendliness', task: 'Check mobile font sizes', details: 'Text should be readable on a small screen without needing to zoom.' },
  { id: 'check-tap-targets', category: 'Mobile Friendliness', task: 'Check tap targets', details: 'Buttons and links should be large enough and spaced out enough to be easily tapped.' },

  // Site Speed
  { id: 'analyze-page-speed', category: 'Site Speed', task: 'Analyze page loading speed', details: 'Use tools like PageSpeed Insights to check performance.' },
  { id: 'optimize-server-response', category: 'Site Speed', task: 'Improve server response time', details: 'Aim for a Time to First Byte (TTFB) under 200ms.' },
  { id: 'enable-compression', category: 'Site Speed', task: 'Enable Gzip or Brotli compression', details: 'Reduce the size of your CSS, HTML, and JavaScript files.' },
  { id: 'minify-css-js', category: 'Site Speed', task: 'Minify CSS, JavaScript, and HTML', details: 'Remove unnecessary characters from code without changing its functionality.' },
  { id: 'leverage-caching', category: 'Site Speed', task: 'Leverage browser caching', details: 'Instruct browsers to store static assets locally to speed up repeat visits.' },
  // FIX: Corrected typo 'id:g' to 'id:'.
  { id: 'use-cdn', category: 'Site Speed', task: 'Use a Content Delivery Network (CDN)', details: 'Serve your content from servers closer to your users to reduce latency.' },

  // Security
  { id: 'use-https', category: 'Security', task: 'Ensure your site uses HTTPS', details: 'Secure your website with an SSL certificate to protect user data and improve trust.' },
  { id: 'check-mixed-content', category: 'Security', task: 'Check for mixed content issues', details: 'Ensure all resources (images, scripts) on an HTTPS page are also served over HTTPS.' },
  { id: 'check-safe-browsing', category: 'Security', task: 'Check for security issues in GSC', details: 'Review the Security & Manual Actions report for any malware or hacked content warnings.' },
];