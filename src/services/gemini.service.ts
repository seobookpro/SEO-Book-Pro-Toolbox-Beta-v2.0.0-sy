import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI;
  private chat: Chat | null = null;
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

  startChat() {
    if (!API_KEY) {
      console.error("API Key not configured.");
      return;
    }
    this.chat = this.genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: this.systemInstruction,
            temperature: 0.7,
        }
    });
  }
  
  async sendChatMessage(message: string): Promise<string> {
    if (!API_KEY) {
      return Promise.resolve("API Key not configured. Please contact support.");
    }
    
    if (!this.chat) {
        this.startChat();
    }

    try {
        if (this.chat) {
            const response: GenerateContentResponse = await this.chat.sendMessage({ message });
            return response.text;
        }
        // This case should ideally not be hit if startChat is called correctly.
        return 'Chat is not initialized. Please start a new chat.'; 
    } catch (error) {
      console.error('Error calling Gemini Chat API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again later.';
    }
  }
}
