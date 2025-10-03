import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, afterNextRender, OnInit, computed, Injector, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { SEO_CHECKLIST_DATA } from '../../data/seo-checklist.data';
import { Chat } from '@google/genai';

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
  private assistantService = inject(AiAssistantService);
  private injector = inject(Injector);
  private sanitizer = inject(DomSanitizer);
  
  // UI State
  isLoading = signal(false);
  
  // Chat State
  private chatSession!: Chat;
  messages = signal<ChatMessage[]>([]);
  currentChatId = signal<string | null>(null);
  currentChatTitle = signal('New Chat');
  userInput = signal('');
  
  // Prompt Generator State
  domains = this.assistantService.domains;
  selectedDomain = signal<string>('');
  newDomainInput = signal('');
  selectedChecklistItems = signal<Set<string>>(new Set());
  checklistData = SEO_CHECKLIST_DATA;
  
  // Saved Chats State
  savedChats = computed(() => this.assistantService.getSortedChats());

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  groupedChecklist = computed(() => {
    return this.checklistData.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as { [category: string]: typeof this.checklistData });
  });
  
  checklistCategories = computed(() => Object.keys(this.groupedChecklist()));

  selectedItemsPerCategory = computed(() => {
    const selected = this.selectedChecklistItems();
    const grouped = this.groupedChecklist();
    const counts: { [category: string]: number } = {};
    for (const category in grouped) {
        const categoryItems = grouped[category];
        counts[category] = categoryItems.filter(item => selected.has(item.id)).length;
    }
    return counts;
  });

  constructor() {
    // FIX: 'effect' was not defined. It has been imported from '@angular/core'.
    effect(() => {
        this.messages();
        afterNextRender(() => {
            this.scrollToBottom();
        }, { injector: this.injector });
    });
  }

  ngOnInit(): void {
    this.startNewChat();
    if (this.domains().length > 0) {
      this.selectedDomain.set(this.domains()[0]);
    }
  }

  startNewChat(): void {
    this.currentChatId.set(null);
    this.currentChatTitle.set('New Chat');
    this.chatSession = this.geminiService.createNewChatSession();
    this.messages.set([
      { role: 'model', content: 'Hello! I am the SEO Audit Pro Bot. How can I help you? Use the Prompt Generator on the right to ask about specific SEO tasks for your domain.' }
    ]);
  }
  
  loadChat(chatId: string): void {
    const chatToLoad = this.assistantService.getChat(chatId);
    if (chatToLoad) {
      this.currentChatId.set(chatToLoad.id);
      this.currentChatTitle.set(chatToLoad.title);
      this.messages.set(chatToLoad.history);
      this.chatSession = this.geminiService.createNewChatSession(chatToLoad.history);
    }
  }
  
  saveChat(): void {
    if (this.messages().length <= 1) return;
    const id = this.currentChatId() ?? Date.now().toString();
    const saved = this.assistantService.saveChat({
      id: id,
      title: this.currentChatTitle(),
      history: this.messages()
    });
    this.currentChatId.set(saved.id);
  }

  deleteChat(chatId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      this.assistantService.deleteChat(chatId);
      if (this.currentChatId() === chatId) {
        this.startNewChat();
      }
    }
  }

  async sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading()) return;
    
    this.isLoading.set(true);
    this.userInput.set('');
    this.messages.update(history => [...history, { role: 'user', content: prompt }]);
    this.scrollToBottom();

    // Auto-generate title on first message
    if (this.messages().length === 2) {
      this.generateChatTitle(prompt);
    }

    try {
      const responseStream = await this.chatSession.sendMessageStream({ message: prompt });
      this.messages.update(history => [...history, { role: 'model', content: '' }]);

      for await (const chunk of responseStream) {
        this.messages.update(history => {
          const lastMessage = history[history.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content += chunk.text;
          }
          return [...history];
        });
      }
    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      this.messages.update(history => [...history, { role: 'error', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      this.isLoading.set(false);
      this.saveChat(); // Auto-save after response
    }
  }

  async generateChatTitle(prompt: string): Promise<void> {
    const titlePrompt = `Based on the following user prompt, create a very short, concise title (4-5 words max) for this conversation. Do not add quotes, punctuation, or any other formatting.

Prompt: "${prompt}"`;
    try {
        const response = await this.geminiService.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: titlePrompt
        });
        this.currentChatTitle.set(response.text.trim());
    } catch (e) {
        console.error("Failed to generate title", e);
        this.currentChatTitle.set(prompt.substring(0, 30) + '...');
    }
  }
  
  generateAndSendPrompt(): void {
    const domain = this.selectedDomain();
    const items = this.selectedChecklistItems();
    if (!domain) {
      alert('Please select or add a domain.'); return;
    }
    if (items.size === 0) {
      alert('Please select at least one checklist item.'); return;
    }

    const selectedTasks = this.checklistData.filter(task => items.has(task.id));
    let prompt = `As an SEO expert, I need a detailed action plan for my website: ${domain}.\n\nPlease provide guidance on the following SEO tasks:\n\n`;
    selectedTasks.forEach(task => {
        prompt += `- **${task.task} (${task.category}):** Explain why this is important and provide a step-by-step guide on how to audit and implement it.\n`;
    });
    prompt += `\nPlease format your response clearly using markdown for readability.`;
    
    this.userInput.set(prompt);
    this.sendMessage();
  }
  
  // --- Domain Methods ---
  addDomain() {
    const domain = this.newDomainInput().trim();
    if (domain) {
      this.assistantService.addDomain(domain);
      this.selectedDomain.set(domain);
      this.newDomainInput.set('');
    }
  }

  removeDomain(domain: string, event: Event) {
    event.stopPropagation();
    this.assistantService.removeDomain(domain);
    if (this.selectedDomain() === domain) {
      this.selectedDomain.set(this.domains()[0] || '');
    }
  }

  // --- Checklist Methods ---
  toggleChecklistItem(itemId: string) {
    this.selectedChecklistItems.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  selectAllChecklistItems(): void {
    const allItemIds = this.checklistData.map(item => item.id);
    this.selectedChecklistItems.set(new Set(allItemIds));
  }

  clearChecklistSelection(): void {
    this.selectedChecklistItems.set(new Set());
  }

  // --- Utility Methods ---
  parseMarkdown(content: string): SafeHtml {
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
    } catch (err) {}
  }
}