import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface OEmbedResponse {
  html: string;
  // Other properties from the oEmbed response are available but not used.
}

@Injectable({ providedIn: 'root' })
export class SoundCloudService {
  private http = inject(HttpClient);
  private oEmbedUrl = 'https://soundcloud.com/oembed';

  /**
   * Fetches the embeddable HTML for a SoundCloud track using the oEmbed endpoint.
   * @param trackUrl The full URL of the SoundCloud track.
   * @returns An Observable that emits the iframe HTML string.
   */
  getEmbedHtml(trackUrl: string): Observable<string> {
    const soundCloudApiUrl = `${this.oEmbedUrl}?format=json&url=${encodeURIComponent(trackUrl)}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(soundCloudApiUrl)}`;
    
    return this.http.get<OEmbedResponse>(proxyUrl).pipe(
      map(response => response.html)
    );
  }
}
