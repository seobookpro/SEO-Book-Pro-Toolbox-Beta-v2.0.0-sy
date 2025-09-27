import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from '@google/genai';

// IMPORTANT: This is a placeholder. In a real app, the API key should be handled securely and not be hardcoded or easily accessible on the client-side.
const API_KEY = process.env.API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PageSpeedMetric {
  name: string;
  value: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface PageSpeedOptimization {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PageSpeedReport {
  overallScore: number;
  metrics: PageSpeedMetric[];
  optimizations: PageSpeedOptimization[];
}

export interface ContentAnalysisReport {
  overallScore: number;
  summary: string;
  readability: {
    score: number;
    level: string;
    interpretation: string;
  };
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
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
  private genAI: GoogleGenAI;
  private chat: Chat | null = null;
  chatHistory = signal<ChatMessage[]>([]);
  private readonly systemInstruction = `You are "SEO-Bot", a friendly and expert AI assistant for the "SEO Audit Pro" application. 
  Your primary goal is to help users with their technical SEO questions. 
  You can answer general SEO questions, suggest appropriate JSON-LD schema types for different content, recommend technical SEO fixes, and help users understand SEO concepts. 
  Provide clear, concise, and actionable advice. Format code snippets (like JSON-LD or meta tags) in markdown code blocks. 
  Be helpful and encouraging.`;

  constructor() {
    if (!API_KEY) {
      console.error("API_KEY is not set. Please set the API_KEY environment variable.");
    }
    this.genAI = new GoogleGenAI({ apiKey: API_KEY });
  }

  // FIX: Added async/await to the Gemini API call to correctly return a Promise.
  async analyzePageSpeed(url: string): Promise<PageSpeedReport | null> {
    if (!API_KEY) {
      console.error("API Key not configured.");
      return Promise.resolve(null);
    }

    const prompt = `
      As a technical SEO and page speed expert, analyze the website at the following URL: ${url}.
      Based on common best practices and potential issues for a site like this, provide a detailed performance report.
      You do not have live access to the URL, so base your analysis on general knowledge of web technologies and common performance bottlenecks.
      Generate a realistic but hypothetical report that includes an overall performance score, key metrics (like FCP, LCP, CLS), and a list of actionable optimizations.
      The report should be structured as a JSON object matching the provided schema.
      For metrics, provide typical values and rate them as 'good', 'needs-improvement', or 'poor'.
      For optimizations, provide a clear title, a description of what to do, and a priority ('high', 'medium', 'low').
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.INTEGER, description: 'A score from 0 to 100 representing overall page performance.' },
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Name of the performance metric (e.g., First Contentful Paint).' },
              value: { type: Type.STRING, description: 'The value of the metric (e.g., 1.2s).' },
              rating: { type: Type.STRING, description: "Rating of the metric: 'good', 'needs-improvement', or 'poor'." }
            },
            propertyOrdering: ["name", "value", "rating"]
          }
        },
        optimizations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Title of the optimization suggestion.' },
              description: { type: Type.STRING, description: 'Detailed description of the optimization and how to implement it.' },
              priority: { type: Type.STRING, description: "Priority of the optimization: 'high', 'medium', or 'low'." }
            },
            propertyOrdering: ["title", "description", "priority"]
          }
        }
      },
      propertyOrdering: ["overallScore", "metrics", "optimizations"]
    };

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.5,
        }
      });
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as PageSpeedReport;
    } catch (error) {
      console.error('Error calling Gemini API for page speed analysis:', error);
      return null;
    }
  }

  // FIX: Added async/await to the Gemini API call to correctly return a Promise.
  async analyzeContent(text: string, keyword: string): Promise<ContentAnalysisReport | null> {
    if (!API_KEY) {
      console.error("API Key not configured.");
      return Promise.resolve(null);
    }
    
    const prompt = `
      As an expert SEO content analyst, analyze the following text. The user's target keyword is "${keyword}".
      Provide a comprehensive analysis covering readability, sentiment, and keyword density.
      The analysis must be returned as a JSON object matching the provided schema.

      Analysis Criteria:
      - overallScore: A holistic score (0-100) reflecting content quality for SEO and user engagement.
      - summary: A concise, one-paragraph overview of the content's strengths and weaknesses.
      - readability:
        - score: Calculate the Flesch Reading Ease score (0-100).
        - level: Describe the reading level (e.g., "8th-grade level", "Difficult to read").
        - interpretation: Briefly explain the score's meaning for a general audience.
      - sentiment:
        - score: A sentiment score from -1.0 (very negative) to 1.0 (very positive).
        - label: The overall sentiment ('positive', 'negative', or 'neutral').
        - interpretation: Briefly explain the sentiment and its potential impact.
      - keywordAnalysis:
        - targetKeyword:
          - keyword: The user-provided target keyword.
          - count: The number of times the target keyword appears.
          - density: The keyword density as a percentage.
          - prominence: An assessment of its usage ('good', 'low' for under-optimized, 'high' for potential stuffing).
        - otherKeywords: A list of the top 5 most relevant, semantically related (LSI) keywords or phrases found, with their counts. Exclude the target keyword from this list.
      - suggestions: A list of 3-5 actionable suggestions to improve the content for better SEO, readability, or user engagement.

      Text to Analyze:
      ---
      ${text}
      ---
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.INTEGER, description: "A holistic score from 0-100." },
        summary: { type: Type.STRING, description: "A one-paragraph summary of the analysis." },
        readability: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Flesch Reading Ease score." },
            level: { type: Type.STRING, description: "Description of the reading level." },
            interpretation: { type: Type.STRING, description: "Interpretation of the score." }
          },
          propertyOrdering: ["score", "level", "interpretation"]
        },
        sentiment: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Sentiment score from -1.0 to 1.0." },
            label: { type: Type.STRING, description: "'positive', 'negative', or 'neutral'." },
            interpretation: { type: Type.STRING, description: "Interpretation of the sentiment." }
          },
          propertyOrdering: ["score", "label", "interpretation"]
        },
        keywordAnalysis: {
          type: Type.OBJECT,
          properties: {
            targetKeyword: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                count: { type: Type.INTEGER },
                density: { type: Type.NUMBER, description: "Density as a percentage, e.g., 1.5 for 1.5%." },
                prominence: { type: Type.STRING, description: "'good', 'low', or 'high'." }
              },
              propertyOrdering: ["keyword", "count", "density", "prominence"]
            },
            otherKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  count: { type: Type.INTEGER }
                },
                propertyOrdering: ["keyword", "count"]
              }
            }
          },
          propertyOrdering: ["targetKeyword", "otherKeywords"]
        },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      propertyOrdering: ["overallScore", "summary", "readability", "sentiment", "keywordAnalysis", "suggestions"]
    };

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.3,
        }
      });
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as ContentAnalysisReport;
    } catch (error) {
      console.error('Error calling Gemini API for content analysis:', error);
      return null;
    }
  }

  private async fetchAndParseUrl(url: string): Promise<string> {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const htmlContent = await lastValueFrom(this.http.get(proxyUrl, { responseType: 'text' }));
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script, style, and common non-content elements
    doc.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());
    
    // Get text content from the body, which is a good approximation of the main content
    return doc.body.textContent || '';
  }

  async analyzeCompetitorContent(userContent: string, competitorUrl: string, keyword: string): Promise<ComparativeAnalysisReport | null> {
    if (!API_KEY) {
      console.error("API Key not configured.");
      return Promise.resolve(null);
    }

    let competitorText: string;
    try {
        competitorText = await this.fetchAndParseUrl(competitorUrl);
        if (!competitorText || competitorText.trim().length < 100) { // Basic check for some content
            throw new Error('Could not extract meaningful content from the competitor URL.');
        }
    } catch (error) {
        console.error('Error fetching or parsing competitor URL:', error);
        throw new Error('Failed to fetch or parse the competitor URL. Please check the URL and try again.');
    }
    
    const prompt = `
      As an expert SEO content analyst, perform a comparative analysis between the user's content and a competitor's content from a given URL. The target keyword is "${keyword}".
      The analysis must be returned as a JSON object matching the provided schema.

      Analysis Criteria:
      - For both the user's content and the competitor's content, analyze:
        - readabilityScore: Flesch Reading Ease score (0-100).
        - sentimentLabel: 'positive', 'negative', or 'neutral'.
        - keywordDensity: The density of the target keyword as a percentage.
      - comparativeSummary: A concise, one-paragraph summary comparing the two pieces of content. Highlight key differences in tone, depth, and keyword usage.
      - actionableSuggestions: A list of 3-5 specific, actionable suggestions for the user to improve their content to better compete with the competitor's page.

      User's Content:
      ---
      ${userContent}
      ---

      Competitor's Content (extracted from ${competitorUrl}):
      ---
      ${competitorText.substring(0, 15000)}
      ---
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING },
        userAnalysis: {
          type: Type.OBJECT,
          properties: {
            readabilityScore: { type: Type.NUMBER },
            sentimentLabel: { type: Type.STRING },
            keywordDensity: { type: Type.NUMBER, description: "Density as a percentage, e.g., 1.5 for 1.5%." }
          },
          propertyOrdering: ["readabilityScore", "sentimentLabel", "keywordDensity"]
        },
        competitorAnalysis: {
          type: Type.OBJECT,
          properties: {
            readabilityScore: { type: Type.NUMBER },
            sentimentLabel: { type: Type.STRING },
            keywordDensity: { type: Type.NUMBER, description: "Density as a percentage, e.g., 1.5 for 1.5%." }
          },
          propertyOrdering: ["readabilityScore", "sentimentLabel", "keywordDensity"]
        },
        comparativeSummary: { type: Type.STRING },
        actionableSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      propertyOrdering: ["keyword", "userAnalysis", "competitorAnalysis", "comparativeSummary", "actionableSuggestions"]
    };

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.3,
        }
      });
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as ComparativeAnalysisReport;
    } catch (error) {
      console.error('Error calling Gemini API for competitor content analysis:', error);
      return null;
    }
  }


  startChat() {
    if (!API_KEY) {
      console.error("API Key not configured.");
      return;
    }
    // Only initialize if chat doesn't exist to maintain context across navigation
    if (!this.chat) {
        this.chat = this.genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: this.systemInstruction,
                temperature: 0.7,
            }
        });
        // Initialize history with a welcome message
        this.chatHistory.set([
            { role: 'model', text: 'Hello! I am SEO-Bot. How can I help you with your technical SEO today?' }
        ]);
    }
  }

  startNewChat() {
    this.chat = null; // Discard old chat session with its history
    this.chatHistory.set([]); // Clear history from the UI
    this.startChat(); // Create new session and add welcome message
  }
  
  async sendChatMessage(message: string): Promise<void> {
    if (!API_KEY) {
      this.chatHistory.update(m => [...m, {role: 'model', text: "API Key not configured. Please contact support."}]);
      return;
    }
    
    if (!this.chat) {
        this.startChat();
    }

    // Add user message to history
    this.chatHistory.update(m => [...m, { role: 'user', text: message }]);

    try {
        if (this.chat) {
            const response: GenerateContentResponse = await this.chat.sendMessage({ message });
            // Add model response to history
            this.chatHistory.update(m => [...m, { role: 'model', text: response.text }]);
        } else {
             // This case should ideally not be hit.
            this.chatHistory.update(m => [...m, { role: 'model', text: 'Chat is not initialized. Please start a new chat.'}]);
        }
    } catch (error) {
      console.error('Error calling Gemini Chat API:', error);
      this.chatHistory.update(m => [...m, { role: 'model', text: 'Sorry, I encountered an error while processing your request. Please try again later.'}]);
    }
  }
}