import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';

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

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI;
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

  async generateContent(prompt: string): Promise<string> {
    if (!API_KEY) {
      return Promise.resolve("API Key not configured. Please contact support.");
    }
    
    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: this.systemInstruction,
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again later.';
    }
  }
}