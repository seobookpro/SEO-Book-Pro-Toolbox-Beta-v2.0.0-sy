import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, afterNextRender, OnInit, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatbotComponent implements OnInit {
  private geminiService = inject(GeminiService);
  private injector = inject(Injector);
  
  // Use history signal from the service
  messages = this.geminiService.chatHistory;
  userInput = signal('');
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');
  
  constructor() {
    // Scroll to bottom whenever messages change
    effect(() => {
        this.messages(); // depend on messages signal
        afterNextRender(() => {
            this.scrollToBottom();
        }, { injector: this.injector });
    });
  }

  ngOnInit(): void {
    this.geminiService.startChat();
  }

  async sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading()) {
      return;
    }
    
    this.userInput.set('');
    this.isLoading.set(true);

    await this.geminiService.sendChatMessage(prompt);
    
    this.isLoading.set(false);
  }

  startNewChat(): void {
    this.geminiService.startNewChat();
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