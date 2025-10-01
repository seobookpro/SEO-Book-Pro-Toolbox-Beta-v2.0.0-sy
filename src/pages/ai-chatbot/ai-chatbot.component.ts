import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, afterNextRender, OnInit, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var marked: { parse(markdown: string, options?: any): string; };
declare var DOMPurify: { sanitize(dirty: string): string; };

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
  private sanitizer = inject(DomSanitizer);
  
  // Use history signal from the service
  messages = this.geminiService.chatHistory;
  userInput = signal('');
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  suggestedPrompts = [
    { title: 'Analyze Meta Tags', prompt: 'Can you analyze these meta tags for a blog post about "healthy breakfast recipes"?\n\n<title>Healthy Breakfast</title>\n<meta name="description" content="Our best recipes for breakfast."_>' },
    { title: 'Improve Page Speed', prompt: 'What are the top 3 most important things I can do to improve my website\'s page speed?' },
    { title: 'Check JSON-LD', prompt: 'Is this JSON-LD for a Product schema correct?\n\n{\n  "@context": "https://schema.org/",\n  "@type": "Product",\n  "name": "My Awesome T-Shirt"\n}' },
    { title: 'Keyword Ideas', prompt: 'Give me 5 long-tail keyword ideas for a website that sells handmade leather bags.' },
  ];
  
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
    if (this.messages().length === 0) {
      this.geminiService.startChat();
    }
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

  useSuggestedPrompt(prompt: string) {
    this.userInput.set(prompt);
  }

  parseMarkdown(content: string): SafeHtml {
    // Marked's `parse` might return a promise if async is true, but we are using it synchronously.
    const dirtyHtml = marked.parse(content, { breaks: true, gfm: true });
    const sanitizedHtml = DOMPurify.sanitize(dirtyHtml);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
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
