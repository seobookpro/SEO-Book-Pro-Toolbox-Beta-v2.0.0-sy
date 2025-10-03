import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatMessage } from './gemini.service';

export interface SavedChat {
  id: string;
  title: string;
  history: ChatMessage[];
  lastUpdated: number;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private platformId = inject(PLATFORM_ID);
  private readonly domainsKey = 'seo-pro-domains';
  private readonly chatsKey = 'seo-pro-saved-chats';

  domains = signal<string[]>([]);
  savedChats = signal<SavedChat[]>([]);

  constructor() {
    this.loadFromLocalStorage();

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.domainsKey, JSON.stringify(this.domains()));
        localStorage.setItem(this.chatsKey, JSON.stringify(this.savedChats()));
      }
    });
  }

  private loadFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.domains.set(JSON.parse(localStorage.getItem(this.domainsKey) || '[]'));
        this.savedChats.set(JSON.parse(localStorage.getItem(this.chatsKey) || '[]'));
      } catch (e) {
        console.error('Failed to parse data from localStorage', e);
        this.domains.set([]);
        this.savedChats.set([]);
      }
    }
  }

  // --- Domain Management ---
  addDomain(domain: string) {
    const cleanDomain = domain.trim();
    if (cleanDomain && !this.domains().includes(cleanDomain)) {
      this.domains.update(d => [cleanDomain, ...d]);
    }
  }

  removeDomain(domain: string) {
    this.domains.update(d => d.filter(x => x !== domain));
  }

  // --- Chat Management ---
  getSortedChats(): SavedChat[] {
    return this.savedChats().sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  getChat(chatId: string): SavedChat | undefined {
    return this.savedChats().find(c => c.id === chatId);
  }

  saveChat(chatData: {id: string, title: string, history: ChatMessage[]}): SavedChat {
    const chatToSave: SavedChat = {
      ...chatData,
      lastUpdated: Date.now()
    };
    
    this.savedChats.update(chats => {
      const index = chats.findIndex(c => c.id === chatToSave.id);
      if (index > -1) {
        const updatedChats = [...chats];
        updatedChats[index] = chatToSave;
        return updatedChats;
      }
      return [chatToSave, ...chats];
    });
    return chatToSave;
  }
  
  deleteChat(chatId: string) {
    this.savedChats.update(chats => chats.filter(c => c.id !== chatId));
  }
}
