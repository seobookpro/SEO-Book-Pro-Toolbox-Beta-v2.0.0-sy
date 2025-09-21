import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-log-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-console.component.html',
  styleUrl: './audit-log-console.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogConsoleComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  logs = [
    { timestamp: new Date('2024-01-01T10:00:00Z').toISOString(), message: 'Audit log console initialized.' },
    { timestamp: new Date('2024-01-01T10:00:01Z').toISOString(), message: 'Application loaded successfully.' },
    { timestamp: new Date('2024-01-01T10:01:25Z').toISOString(), message: 'User navigated to Dashboard.' },
    { timestamp: new Date('2024-01-01T10:02:40Z').toISOString(), message: '[INFO] Ready for user input.' },
  ];
}
