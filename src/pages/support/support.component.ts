import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
  formStatus = signal<'idle' | 'submitting' | 'submitted'>('idle');

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.formStatus.set('submitting');
    // Simulate an API call
    setTimeout(() => {
      console.log('Form submitted:', form.value);
      this.formStatus.set('submitted');
      form.resetForm();
      setTimeout(() => this.formStatus.set('idle'), 5000);
    }, 1500);
  }
}