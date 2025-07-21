# Fishbowl AI - Tauri + React Native AI Service Architecture

See the [monorepo architecture guide](./monorepo.md) for an overview of the project structure and technology stack.

## AI Service Architecture

Sample implementation of a multi-provider AI service that supports OpenAI, Anthropic, and Google AI.

### Multi-Provider AI Service

**packages/shared/src/services/ai/types.ts**
```typescript
export interface AIProvider {
  name: string;
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  supportsStreaming: boolean;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatOptions extends CompletionOptions {
  systemPrompt?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**packages/shared/src/services/ai/providers/openai.ts**
```typescript
import { AIProvider, ChatOptions, Message, ChatResponse } from '../types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  supportsStreaming = true;
  
  constructor(private apiKey: string) {}
  
  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.chat([{ role: 'user', content: prompt }], options);
    return response.content;
  }
  
  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-3.5-turbo',
        messages: options?.systemPrompt 
          ? [{ role: 'system', content: options.systemPrompt }, ...messages]
          : messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }
}
```

**packages/shared/src/services/ai/providers/anthropic.ts**
```typescript
import { AIProvider, ChatOptions, Message, ChatResponse } from '../types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  supportsStreaming = true;
  
  constructor(private apiKey: string) {}
  
  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.chat([{ role: 'user', content: prompt }], options);
    return response.content;
  }
  
  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-sonnet-20240229',
        messages,
        system: options?.systemPrompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens || 1024
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }
}
```

**packages/shared/src/services/ai/index.ts**
```typescript
import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleAIProvider } from './providers/google';
import { SecureStorage } from '../secure-storage';

export class AIService {
  private providers = new Map<string, AIProvider>();
  
  constructor(private secureStorage: SecureStorage) {}
  
  async initialize() {
    // Load API keys from secure storage
    const keys = await this.secureStorage.getAPIKeys();
    
    for (const { provider, key } of keys) {
      switch (provider) {
        case 'openai':
          this.providers.set(provider, new OpenAIProvider(key));
          break;
        case 'anthropic':
          this.providers.set(provider, new AnthropicProvider(key));
          break;
        case 'google':
          this.providers.set(provider, new GoogleAIProvider(key));
          break;
      }
    }
  }
  
  async chat(provider: string, messages: Message[], options?: ChatOptions) {
    const aiProvider = this.providers.get(provider);
    if (!aiProvider) {
      throw new Error(`Provider ${provider} not configured`);
    }
    return aiProvider.chat(messages, options);
  }
  
  async complete(provider: string, prompt: string, options?: CompletionOptions) {
    const aiProvider = this.providers.get(provider);
    if (!aiProvider) {
      throw new Error(`Provider ${provider} not configured`);
    }
    return aiProvider.complete(prompt, options);
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  async addProvider(provider: string, apiKey: string) {
    // Save to secure storage
    await this.secureStorage.saveAPIKey(provider, apiKey);
    
    // Initialize provider
    switch (provider) {
      case 'openai':
        this.providers.set(provider, new OpenAIProvider(apiKey));
        break;
      case 'anthropic':
        this.providers.set(provider, new AnthropicProvider(apiKey));
        break;
      case 'google':
        this.providers.set(provider, new GoogleAIProvider(apiKey));
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
  
  async removeProvider(provider: string) {
    await this.secureStorage.removeAPIKey(provider);
    this.providers.delete(provider);
  }
}
```
