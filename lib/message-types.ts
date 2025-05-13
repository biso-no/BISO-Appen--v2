/**
 * Message types for AI chat functionality
 * This replaces the previous mastra-api.ts implementation
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  threadId?: string;
} 