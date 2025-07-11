/**
 * AI message format following Vercel AI SDK patterns.
 * This matches the format expected by AI providers like OpenAI, Anthropic, etc.
 */
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  createdAt?: Date;
}
