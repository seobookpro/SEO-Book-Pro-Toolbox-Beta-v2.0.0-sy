import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-documentation',
  standalone: true,
  templateUrl: './documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationComponent {}