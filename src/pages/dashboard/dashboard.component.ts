import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ToolCard {
  title: string;
  description: string;
  link: string;
  icon: string; // Material icon name
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">Welcome to SEO Audit Pro. Here are your tools to get started.</p>
      </header>

      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Core Tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          @for (tool of mainTools; track tool.title) {
            <a [routerLink]="tool.link" 
               class="group relative block p-6 rounded-xl overflow-hidden text-white transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
              <div [class]="'absolute inset-0 bg-gradient-to-br ' + tool.bgColor"></div>
              <div class="relative z-10 flex flex-col h-full">
                <span class="material-icons-outlined text-4xl mb-3">{{ tool.icon }}</span>
                <h3 class="text-xl font-bold">{{ tool.title }}</h3>
                <p class="mt-2 text-gray-200 flex-grow">{{ tool.description }}</p>
                <div class="mt-4 text-sm font-semibold flex items-center">
                  Go to Tool <span class="material-icons-outlined ml-1 text-base transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                </div>
              </div>
            </a>
          }
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Generators & Resources</h2>
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (tool of secondaryTools; track tool.title) {
            <a [routerLink]="tool.link" 
               class="group flex items-start p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
              <div class="flex-shrink-0 mr-4">
                <div class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                   <span class="material-icons-outlined text-2xl text-orange-600 dark:text-orange-400">{{ tool.icon }}</span>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ tool.title }}</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ tool.description }}</p>
              </div>
            </a>
          }
        </div>
      </section>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  
  mainTools: ToolCard[] = [
    {
      title: 'Live SEO Audit',
      description: 'Run a comprehensive, real-time audit of any webpage to identify technical SEO issues.',
      link: '/live-seo-audit',
      icon: 'analytics',
      bgColor: 'from-orange-500 to-red-500'
    },
    {
      title: 'Page Speed Analyzer',
      description: 'Get a detailed performance report and actionable advice to make your site faster.',
      link: '/page-speed-analyzer',
      icon: 'speed',
      bgColor: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Content Analyzer',
      description: 'Analyze your text for SEO, readability, and sentiment to create high-ranking content.',
      link: '/content-analyzer',
      icon: 'document_scanner',
      bgColor: 'from-green-500 to-teal-500'
    },
    {
      title: 'AI SEO Chatbot',
      description: 'Ask any SEO question and get expert answers from our AI-powered assistant.',
      link: '/ai-chatbot',
      icon: 'smart_toy',
      bgColor: 'from-purple-500 to-pink-500'
    }
  ];

  secondaryTools: ToolCard[] = [
    {
      title: 'SEO Audit Checklist',
      description: 'Follow a step-by-step checklist to ensure your technical SEO is flawless.',
      link: '/seo-audit-checklist',
      icon: 'checklist',
      bgColor: 'bg-gray-700'
    },
    {
      title: 'Meta Tag Generator',
      description: 'Quickly create optimized title tags and meta descriptions that improve CTR.',
      link: '/seo-generator',
      icon: 'tag',
      bgColor: 'bg-gray-700'
    },
    {
      title: 'JSON-LD Generator',
      description: 'Generate structured data markup to help your site earn rich snippets in search results.',
      link: '/json-ld-generator',
      icon: 'data_object',
      bgColor: 'bg-gray-700'
    },
    {
      title: 'SEO Foundations',
      description: 'Learn the core concepts of SEO with our easy-to-understand guides.',
      link: '/seo-foundations',
      icon: 'foundation',
      bgColor: 'bg-gray-700'
    },
     {
      title: 'SEO Glossary',
      description: 'A comprehensive dictionary of SEO terms and definitions.',
      link: '/seo-glossary',
      icon: 'library_books',
      bgColor: 'bg-gray-700'
    }
  ];
}
