import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SoundCloudService } from '../../services/soundcloud.service';

interface Podcast {
  url: string;
  embedHtml: SafeHtml | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-podcasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podcasts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodcastsComponent implements OnInit {
  private soundCloudService = inject(SoundCloudService);
  private sanitizer = inject(DomSanitizer);

  // A curated list of SEO-related podcast episodes from SoundCloud
  private podcastUrls = [
    'https://soundcloud.com/seobookpro/seo-cms-blueprint-software-build-plan-the-technical-blueprint-for-the-ultimate-seo-llm-content-management-system',
    'https://soundcloud.com/seobookpro/technical-seo-audit-toolbox-beta-v201',
    'https://soundcloud.com/seobookpro/the-ultimate-seo-toolbox-beta-v200-is-here-technical-seo-audit-for-seo-book-pro',
    'https://soundcloud.com/seobookpro/the-technical-seo-audit-toolbox-beta-v109',
    'https://soundcloud.com/user-437593575/episode-216-the-seo-podcast-mach-10-interview-with-cyrus-shepard',
    'https://soundcloud.com/user-437593575/episode-210-the-seo-podcast-mach-10-interview-with-kevin-indig',
    'https://soundcloud.com/search-off-the-record/content-pruning-for-your-website',
    'https://soundcloud.com/moz-podcasts/the-state-of-local-seo-whiteboard-friday'
  ];
  
  podcasts = signal<Podcast[]>([]);

  ngOnInit(): void {
    // Initialize the podcasts signal with loading states
    const initialPodcasts = this.podcastUrls.map(url => ({
      url,
      embedHtml: null,
      loading: true,
      error: null
    }));
    this.podcasts.set(initialPodcasts);

    // Create an array of Observables to fetch embed HTML for each podcast
    const embedRequests = this.podcastUrls.map(url => 
      this.soundCloudService.getEmbedHtml(url).pipe(
        map(html => ({ url, html })), // Pass along the URL with the result
        catchError(error => {
          console.error('Failed to fetch SoundCloud embed for', url, error);
          return of({ url, error: 'Failed to load player.' });
        })
      )
    );

    // Execute all requests in parallel and process the results
    forkJoin(embedRequests).subscribe(results => {
      const finalPodcasts = results.map(result => {
        if ('html' in result) {
          // Success case
          return {
            url: result.url,
            embedHtml: this.sanitizer.bypassSecurityTrustHtml(result.html),
            loading: false,
            error: null
          };
        } else {
          // Error case
          return {
            url: result.url,
            embedHtml: null,
            loading: false,
            error: result.error
          };
        }
      });
      this.podcasts.set(finalPodcasts);
    });
  }
}
