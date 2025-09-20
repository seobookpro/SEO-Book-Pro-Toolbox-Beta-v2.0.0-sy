import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatbotComponent {
  private geminiService = inject(GeminiService);
  
  messages = signal<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am SEO-Bot. How can I help you with your technical SEO today?' }
  ]);
  userInput = signal('');
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');
  
  constructor() {
    afterNextRender(() => {
        this.scrollToBottom();
    });
  }

  async sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading()) {
      return;
    }

    this.messages.update(m => [...m, { role: 'user', text: prompt }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    const responseText = await this.geminiService.generateContent(prompt);
    
    this.messages.update(m => [...m, { role: 'model', text: responseText }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }
  
  private scrollToBottom(): void {
    try {
      const container = this.chatContainer()?.nativeElement;
      if(container) {
          container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
