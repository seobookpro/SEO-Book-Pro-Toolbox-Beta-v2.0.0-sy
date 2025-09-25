export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  details: string;
}

export const SEO_CHECKLIST_DATA: ChecklistItem[] = [
  // Basics
  { id: 'setup-gsc', category: 'Basics', task: 'Set up Google Search Console', details: 'Verify site ownership and submit sitemaps to monitor search performance.' },
  { id: 'setup-analytics', category: 'Basics', task: 'Set up Google Analytics', details: 'Install tracking code to monitor website traffic and user behavior.' },
  { id: 'check-manual-actions', category: 'Basics', task: 'Check for Google manual actions', details: 'Look in Google Search Console for any penalties that might affect your ranking.' },
  { id: 'define-http-https', category: 'Basics', task: 'Ensure only one version of your site is browseable', details: 'Check that http, https, www, and non-www versions all redirect to a single canonical version.' },

  // Crawling & Indexing
  { id: 'review-robots-txt', category: 'Crawling & Indexing', task: 'Review robots.txt file', details: 'Ensure you aren\'t blocking important content and that your sitemap is referenced.' },
  { id: 'find-crawl-errors', category: 'Crawling & Indexing', task: 'Find and fix crawl errors', details: 'Use GSC’s Coverage report to identify and resolve crawling issues.' },
  { id: 'check-index-status', category: 'Crawling & Indexing', task: 'Check Google index status', details: 'Use the "site:" search operator (e.g., site:yourdomain.com) to see how many pages are indexed.' },
  { id: 'use-sitemap', category: 'Crawling & Indexing', task: 'Create and submit an XML sitemap', details: 'Help search engines discover all important pages on your site.' },

  // Meta & Structured Data
  { id: 'optimize-titles', category: 'Meta & Structured Data', task: 'Optimize title tags', details: 'Ensure every page has a unique, descriptive title tag under 60 characters.' },
  { id: 'optimize-metas', category: 'Meta & Structured Data', task: 'Optimize meta descriptions', details: 'Write unique, compelling meta descriptions (under 160 characters) for key pages to improve CTR.' },
  { id: 'use-canonicals', category: 'Meta & Structured Data', task: 'Use canonical tags for duplicate content', details: 'Specify the preferred "master" version of a page to consolidate link equity and avoid duplicate content issues.' },
  { id: 'check-structured-data', category: 'Meta & Structured Data', task: 'Check for structured data opportunities', details: 'Implement schema markup (like Article, Product, FAQ) to be eligible for rich snippets.' },

  // Content
  { id: 'check-h1', category: 'Content', task: 'Check for a single H1 tag', details: 'Each page should have one, and only one, H1 tag that describes the page content.' },
  { id: 'use-subheadings', category: 'Content', task: 'Use header tags (H2-H6) correctly', details: 'Structure your content logically with subheadings to improve readability.' },
  { id: 'find-thin-content', category: 'Content', task: 'Find and improve thin content', details: 'Expand pages with little or no content to provide more value to users.' },
  { id: 'check-duplicate-content', category: 'Content', task: 'Check for internal duplicate content', details: 'Ensure you don\'t have multiple pages competing for the same keywords.' },
  { id: 'optimize-content-quality', category: 'Content', task: 'Ensure content is high-quality', details: 'Content should be well-written, informative, and meet user intent.' },

  // Links & Navigation
  { id: 'check-site-structure', category: 'Links & Navigation', task: 'Check for logical site structure and page depth', details: 'Ensure your site has a clear hierarchy and key pages are reachable within 3-4 clicks from the homepage.' },
  { id: 'use-breadcrumbs', category: 'Links & Navigation', task: 'Use breadcrumbs', details: 'Implement breadcrumbs to help users and search engines understand the page hierarchy.' },
  { id: 'check-urls', category: 'Links & Navigation', task: 'Ensure URLs are SEO-friendly', details: 'Use simple, descriptive, and readable URLs with keywords where appropriate.' },
  { id: 'fix-broken-links', category: 'Links & Navigation', task: 'Fix broken internal and external links', details: 'Broken links create a poor user experience and waste crawl budget.' },
  { id: 'check-redirects', category: 'Links & Navigation', task: 'Check for redirect chains and loops', details: 'Use permanent (301) redirects for moved content and avoid long redirect chains.' },

  // Website Images
  { id: 'optimize-images', category: 'Website Images', task: 'Optimize images', details: 'Compress images and use descriptive alt text for all important images.' },
  { id: 'image-filenames', category: 'Website Images', task: 'Use descriptive image filenames', details: 'Use filenames that describe the image content (e.g., "blue-widget.jpg" instead of "IMG_123.jpg").' },
  { id: 'image-next-gen', category: 'Website Images', task: 'Serve images in next-gen formats', details: 'Use formats like WebP or AVIF for better compression and quality.' },

  // Website Videos
  { id: 'video-sitemap', category: 'Website Videos', task: 'Create a video sitemap', details: 'Help search engines find and understand the video content on your site.' },
  { id: 'video-schema', category: 'Website Videos', task: 'Use VideoObject schema markup', details: 'Provide details like the video thumbnail, description, and upload date to search engines.' },
  { id: 'video-optimization', category: 'Website Videos', task: 'Optimize video loading', details: 'Embed videos efficiently and consider lazy-loading to not impact page speed.' },

  // Website Mobile Version
  { id: 'mobile-friendly-test', category: 'Website Mobile Version', task: 'Run the Mobile-Friendly Test', details: 'Use Google’s test to ensure your pages are easy to use on mobile devices.' },
  { id: 'check-viewport', category: 'Website Mobile Version', task: 'Check for viewport meta tag', details: 'Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is present.' },
  { id: 'check-font-size', category: 'Website Mobile Version', task: 'Check mobile font sizes', details: 'Text should be readable on a small screen without needing to zoom.' },
  { id: 'check-tap-targets', category: 'Website Mobile Version', task: 'Check tap targets', details: 'Buttons and links should be large enough and spaced out enough to be easily tapped.' },
  
  // Website Page Speed
  { id: 'analyze-page-speed', category: 'Website Page Speed', task: 'Analyze page loading speed', details: 'Use tools like PageSpeed Insights to check performance and Core Web Vitals.' },
  { id: 'optimize-server-response', category: 'Website Page Speed', task: 'Improve server response time', details: 'Aim for a Time to First Byte (TTFB) under 200ms.' },
  { id: 'enable-compression', category: 'Website Page Speed', task: 'Enable Gzip or Brotli compression', details: 'Reduce the size of your CSS, HTML, and JavaScript files.' },
  { id: 'minify-css-js', category: 'Website Page Speed', task: 'Minify CSS, JavaScript, and HTML', details: 'Remove unnecessary characters from code without changing its functionality.' },
  { id: 'leverage-caching', category: 'Website Page Speed', task: 'Leverage browser caching', details: 'Instruct browsers to store static assets locally to speed up repeat visits.' },
  { id: 'use-cdn', category: 'Website Page Speed', task: 'Use a Content Delivery Network (CDN)', details: 'Serve your content from servers closer to your users to reduce latency.' },
  
  // Website Security
  { id: 'use-https', category: 'Website Security', task: 'Ensure your site uses HTTPS', details: 'Secure your website with an SSL certificate to protect user data and improve trust.' },
  { id: 'check-mixed-content', category: 'Website Security', task: 'Check for mixed content issues', details: 'Ensure all resources (images, scripts) on an HTTPS page are also served over HTTPS.' },
  { id: 'check-safe-browsing', category: 'Website Security', task: 'Check for security issues in GSC', details: 'Review the Security & Manual Actions report for any malware or hacked content warnings.' },

  // International & Multilingual
  { id: 'use-hreflang', category: 'International & Multilingual', task: 'Use hreflang tags for language/region targeting', details: 'Tell Google about localized versions of your page, so it can serve the correct version to users.' },
  { id: 'use-lang-attribute', category: 'International & Multilingual', task: 'Use the `lang` attribute in your HTML tag', details: 'Specify the language of the page content (e.g., `<html lang="en">`).' },
  { id: 'local-url-structure', category: 'International & Multilingual', task: 'Use a localized URL structure', details: 'Use ccTLDs (e.g., .de), subdomains (e.g., de.example.com), or subdirectories (e.g., example.com/de/).' },

  // Backlinks (Off-Page)
  { id: 'analyze-backlink-profile', category: 'Backlinks (Off-Page)', task: 'Analyze your backlink profile', details: 'Use tools to understand who links to you and what your domain authority is.' },
  { id: 'disavow-toxic-links', category: 'Backlinks (Off-Page)', task: 'Disavow toxic or spammy links', details: 'Submit a disavow file to Google to ask it to ignore low-quality links.' },
  { id: 'competitor-backlink-analysis', category: 'Backlinks (Off-Page)', task: 'Analyze competitor backlink strategies', details: 'Identify where your competitors are getting links to find new opportunities.' },
];
