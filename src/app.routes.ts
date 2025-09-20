import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | SEO Book Pro',
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'json-ld-generator',
    loadComponent: () => import('./pages/json-ld-generator/json-ld-generator.component').then(m => m.JsonLdGeneratorComponent),
    title: 'JSON-LD Generator | SEO Book Pro',
    data: { breadcrumb: 'JSON-LD Generator' }
  },
  {
    path: 'seo-generator',
    loadComponent: () => import('./pages/seo-generator/seo-generator.component').then(m => m.SeoGeneratorComponent),
    title: 'SEO Generator | SEO Book Pro',
    data: { breadcrumb: 'SEO Generator' }
  },
  {
    path: 'faqs',
    loadComponent: () => import('./pages/faqs/faqs.component').then(m => m.FaqsComponent),
    title: 'FAQs | SEO Book Pro',
    data: { breadcrumb: 'FAQs' }
  },
  {
    path: 'documentation',
    loadComponent: () => import('./pages/documentation/documentation.component').then(m => m.DocumentationComponent),
    title: 'Documentation | SEO Book Pro',
    data: { breadcrumb: 'Documentation' }
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent),
    title: 'Support | SEO Book Pro',
    data: { breadcrumb: 'Support' }
  },
  {
    path: 'ai-chatbot',
    loadComponent: () => import('./pages/ai-chatbot/ai-chatbot.component').then(m => m.AiChatbotComponent),
    title: 'AI Chatbot | SEO Book Pro',
    data: { breadcrumb: 'AI Chatbot' }
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];