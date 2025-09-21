import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard' }
    },
    {
        path: 'page-speed-analyzer',
        loadComponent: () => import('./pages/page-speed-analyzer/page-speed-analyzer.component').then(m => m.PageSpeedAnalyzerComponent),
        data: { breadcrumb: 'Page Speed Analyzer' }
    },
    {
        path: 'json-ld-generator',
        loadComponent: () => import('./pages/json-ld-generator/json-ld-generator.component').then(m => m.JsonLdGeneratorComponent),
        data: { breadcrumb: 'JSON-LD Generator' }
    },
    {
        path: 'seo-generator',
        loadComponent: () => import('./pages/seo-generator/seo-generator.component').then(m => m.SeoGeneratorComponent),
        data: { breadcrumb: 'Meta Tag Generator' }
    },
    {
        path: 'seo-audit-checklist',
        loadComponent: () => import('./pages/seo-audit-checklist/seo-audit-checklist.component').then(m => m.SeoAuditChecklistComponent),
        data: { breadcrumb: 'SEO Audit Checklist' }
    },
    {
        path: 'seo-glossary',
        loadComponent: () => import('./pages/seo-glossary/seo-glossary.component').then(m => m.SeoGlossaryComponent),
        data: { breadcrumb: 'SEO Glossary' }
    },
    {
        path: 'ai-chatbot',
        loadComponent: () => import('./pages/ai-chatbot/ai-chatbot.component').then(m => m.AiChatbotComponent),
        data: { breadcrumb: 'AI Chatbot' }
    },
     {
        path: 'live-seo-audit',
        loadComponent: () => import('./pages/live-seo-audit/live-seo-audit.component').then(m => m.LiveSeoAuditComponent),
        data: { breadcrumb: 'Live SEO Audit' }
    },
    {
        path: 'documentation',
        loadComponent: () => import('./pages/documentation/documentation.component').then(m => m.DocumentationComponent),
        data: { breadcrumb: 'Documentation' }
    },
    {
        path: 'support',
        loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent),
        data: { breadcrumb: 'Support' }
    },
    {
        path: 'faqs',
        loadComponent: () => import('./pages/faqs/faqs.component').then(m => m.FaqsComponent),
        data: { breadcrumb: 'FAQs' }
    },
    { path: '**', redirectTo: 'dashboard' } // Wildcard route
];
