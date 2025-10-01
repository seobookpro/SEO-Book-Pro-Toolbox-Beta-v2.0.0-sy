import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { lastValueFrom } from 'rxjs';

// --- INTERFACES ---

export interface ChatMessage {
  role: 'user' | 'model' | 'error';
  content: string;
}

export interface PageSpeedReport {
  overallScore: number;
  summary: string;
  coreWebVitals: {
    lcp: { score: number; rating: 'good' | 'needs-improvement' | 'poor' };
    fid: { score: number; rating: 'good' | 'needs-improvement' | 'poor' };
    cls: { score: number; rating: 'good' | 'needs-improvement' | 'poor' };
  };
  performanceMetrics: {
    metric: string;
    score: number;
    description: string;
  }[];
  actionableRecommendations: {
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    details: string;
  }[];
}

export interface ContentAnalysisReport {
  overallScore: number;
  summary: string;
  readability: {
    score: number;
    level: string; // e.g., "8th Grade"
    interpretation: string;
  };
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    interpretation: string;
  };
  keywordAnalysis: {
    targetKeyword: {
      keyword: string;
      count: number;
      density: number;
      prominence: 'good' | 'low' | 'high';
    };
    otherKeywords: {
      keyword: string;
      count: number;
    }[];
  };
  suggestions: string[];
}

export interface ComparativeAnalysisReport {
  keyword: string;
  userAnalysis: {
    readabilityScore: number;
    sentimentLabel: 'positive' | 'negative' | 'neutral';
    keywordDensity: number;
  };
  competitorAnalysis: {
    readabilityScore: number;
    sentimentLabel: 'positive' | 'negative' | 'neutral';
    keywordDensity: number;
  };
  comparativeSummary: string;
  actionableSuggestions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private http = inject(HttpClient);
  private ai: GoogleGenAI;
  private chat!: Chat;

  // Signal for chat history
  chatHistory = signal<ChatMessage[]>([]);

  constructor() {
    // The API key is expected to be available in the execution environment.
    const apiKey = (process as any).env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey! });
  }

  // --- Chat Functionality ---

  startChat(): void {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are an expert SEO analyst and consultant. Your name is "SEO Audit Pro Bot". Provide helpful, accurate, and concise answers to SEO-related questions. When giving advice, be clear and provide actionable steps. Format your answers with rich markdown for readability, including lists, bold text, italics, code blocks, and tables where appropriate. You can analyze user-provided data like meta tags, JSON-LD snippets, or lists of keywords and provide specific, actionable feedback. You can also answer general questions about page speed optimization, content strategy, and link building based on SEO best practices.',
      },
    });
    this.chatHistory.set([
      { role: 'model', content: 'Hello! I am the SEO Audit Pro Bot. How can I help you with your SEO questions today? Ask me to analyze your meta tags, check your JSON-LD, or give you page speed advice!' }
    ]);
  }

  startNewChat(): void {
    this.startChat();
  }

  async sendChatMessage(prompt: string): Promise<void> {
    this.chatHistory.update(history => [...history, { role: 'user', content: prompt }]);

    try {
      const responseStream = await this.chat.sendMessageStream({ message: prompt });
      
      this.chatHistory.update(history => [...history, { role: 'model', content: '' }]);

      for await (const chunk of responseStream) {
        this.chatHistory.update(history => {
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
      this.chatHistory.update(history => [...history, { role: 'error', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    }
  }
  
  // --- Page Speed Analysis ---

  async analyzePageSpeed(url: string): Promise<PageSpeedReport | null> {
    const prompt = `
      Analyze the page speed of the website at this URL: ${url}.
      You are an expert Page Speed Analyst. Your response MUST be a JSON object that conforms to the provided schema.
      Simulate a realistic analysis based on common performance best practices for a modern website.
      Do not include any text outside of the JSON object.
      Generate plausible scores and recommendations. The analysis should be critical but fair.
      - For Core Web Vitals, provide a score (in ms for LCP/FID, unitless for CLS) and a rating.
      - For Performance Metrics, include at least 4 common metrics like FCP, SI, TTI, and TBT.
      - For Actionable Recommendations, provide at least 3 high-priority and 2 medium-priority recommendations with clear details.
    `;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.INTEGER, description: "An overall performance score from 0 to 100." },
        summary: { type: Type.STRING, description: "A brief summary of the performance analysis." },
        coreWebVitals: {
          type: Type.OBJECT,
          properties: {
            lcp: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, rating: { type: Type.STRING } } },
            fid: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, rating: { type: Type.STRING } } },
            cls: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, rating: { type: Type.STRING } } },
          },
        },
        performanceMetrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              metric: { type: Type.STRING },
              score: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
          },
        },
        actionableRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              priority: { type: Type.STRING },
              details: { type: Type.STRING },
            },
          },
        },
      },
      required: ['overallScore', 'summary', 'coreWebVitals', 'performanceMetrics', 'actionableRecommendations'],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const jsonText = response.text.trim();
      const report = JSON.parse(jsonText) as PageSpeedReport;
      return report;
    } catch (error) {
        console.error('Error analyzing page speed with Gemini:', error);
        throw new Error('Failed to generate page speed report from AI. The model may have returned an invalid response.');
    }
  }
  
  // --- Content Analysis ---

  async analyzeContent(text: string, keyword: string): Promise<ContentAnalysisReport | null> {
    const prompt = `
      Analyze the following text for SEO, readability, and sentiment. The primary target keyword is "${keyword}".
      Your response MUST be a JSON object that conforms to the provided schema. Do not include any text outside the JSON object.
      
      Text to analyze:
      ---
      ${text}
      ---
    `;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.INTEGER, description: "A score from 0-100 for overall content quality." },
        summary: { type: Type.STRING, description: "A brief summary of the content analysis." },
        readability: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Flesch-Kincaid Reading Ease score." },
            level: { type: Type.STRING, description: "e.g., '8th Grade'" },
            interpretation: { type: Type.STRING },
          },
        },
        sentiment: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "'positive', 'negative', or 'neutral'" },
            score: { type: Type.NUMBER, description: "A score from -1 to 1." },
            interpretation: { type: Type.STRING },
          },
        },
        keywordAnalysis: {
          type: Type.OBJECT,
          properties: {
            targetKeyword: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                count: { type: Type.INTEGER },
                density: { type: Type.NUMBER, description: "As a percentage, e.g., 1.5 for 1.5%" },
                prominence: { type: Type.STRING, description: "'good', 'low', or 'high'" },
              },
            },
            otherKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                },
              },
            },
          },
        },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['overallScore', 'summary', 'readability', 'sentiment', 'keywordAnalysis', 'suggestions'],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const jsonText = response.text.trim();
      const report = JSON.parse(jsonText) as ContentAnalysisReport;
      return report;
    } catch (error) {
      console.error('Error analyzing content with Gemini:', error);
      throw new Error('Failed to generate content report from AI.');
    }
  }

  // --- Comparative Content Analysis ---

  async analyzeCompetitorContent(userText: string, competitorUrl: string, keyword: string): Promise<ComparativeAnalysisReport | null> {
    const competitorText = await this.fetchAndCleanHtml(competitorUrl);

    if (!competitorText) {
      throw new Error(`Could not fetch or parse content from competitor URL: ${competitorUrl}`);
    }

    const prompt = `
      Perform a comparative SEO analysis of two pieces of content targeting the keyword "${keyword}".
      Your response MUST be a JSON object that conforms to the provided schema. Do not include any text outside the JSON object.

      Your Content:
      ---
      ${userText}
      ---

      Competitor's Content (from ${competitorUrl}):
      ---
      ${competitorText}
      ---
    `;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING },
        userAnalysis: {
          type: Type.OBJECT,
          properties: {
            readabilityScore: { type: Type.NUMBER },
            sentimentLabel: { type: Type.STRING },
            keywordDensity: { type: Type.NUMBER },
          },
        },
        competitorAnalysis: {
          type: Type.OBJECT,
          properties: {
            readabilityScore: { type: Type.NUMBER },
            sentimentLabel: { type: Type.STRING },
            keywordDensity: { type: Type.NUMBER },
          },
        },
        comparativeSummary: { type: Type.STRING },
        actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['keyword', 'userAnalysis', 'competitorAnalysis', 'comparativeSummary', 'actionableSuggestions'],
    };
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const jsonText = response.text.trim();
      const report = JSON.parse(jsonText) as ComparativeAnalysisReport;
      return report;
    } catch (error) {
      console.error('Error analyzing competitor content with Gemini:', error);
      throw new Error('Failed to generate comparative analysis from AI.');
    }
  }

  private async fetchAndCleanHtml(url: string): Promise<string> {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    try {
      const htmlContent = await lastValueFrom(this.http.get(proxyUrl, { responseType: 'text' }));
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Remove script and style elements
      doc.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());
      
      // Attempt to find the main content area
      let mainContent = doc.querySelector('main') || doc.querySelector('article') || doc.querySelector('[role="main"]');
      if (!mainContent) {
          mainContent = doc.body; // Fallback to body
      }

      // Get text, clean up whitespace, and limit length to avoid overly large prompts
      return (mainContent.textContent || '')
          .replace(/\s\s+/g, ' ')
          .trim()
          .slice(0, 15000); // Limit to ~15k characters
    } catch (error) {
      console.error(`Failed to fetch and clean HTML from ${url}:`, error);
      return '';
    }
  }
}