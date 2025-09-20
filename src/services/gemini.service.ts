import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// IMPORTANT: This is a placeholder. In a real app, the API key should be handled securely and not be hardcoded or easily accessible on the client-side.
const API_KEY = process.env.API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
