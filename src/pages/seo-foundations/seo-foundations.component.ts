import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seo-foundations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seo-foundations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoFoundationsComponent {}
