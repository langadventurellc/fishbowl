---
id: F-llm-provider-system
title: LLM Provider System Implementation
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T00:06:15.858Z
updated: 2025-08-29T00:06:15.858Z
---

# LLM Provider System Implementation

## Purpose and Functionality

Implement a comprehensive LLM provider abstraction system that enables the Fishbowl chat system to interact with multiple AI providers (OpenAI, Anthropic, and Mock) through a unified interface. This system handles multi-agent conversation formatting, context building, and provider-specific API interactions.

## Key Components to Implement

### 1. Core Interface Layer
- `LlmProvider` interface with unified `sendMessage` method
- `LlmRequestParams`, `LlmResponse`, and `FormattedMessage` types
- Provider-agnostic error hierarchy (`LlmProviderError`, `LlmRateLimitError`, etc.)

### 2. Provider Implementations
- **OpenAIProvider**: Integrates with OpenAI Chat Completions API
- **AnthropicProvider**: Handles Anthropic Messages API with role alternation
- **MockProvider**: Returns predefined responses for testing (no external API calls)

### 3. Message Formatting Service
- Transforms multi-agent conversations into user/agent format for LLM APIs
- Implements message flattening strategy: all non-target-agent messages become "user" messages
- Filters messages based on `included` field and excludes system messages
- Handles agent attribution in formatted messages

### 4. Service Layer
- `LlmService`: Main orchestration service coordinating providers and formatting
- `LlmProviderFactory`: Creates appropriate provider instances based on configuration
- Integration with existing `SystemPromptService` for agent context

## Detailed Acceptance Criteria

### Core Interface Requirements
- ✅ `LlmProvider` interface accepts system prompt, formatted messages, LLM config, and agent name
- ✅ All providers return standardized `LlmResponse` with content and optional metadata
- ✅ Type definitions include proper Zod validation schemas
- ✅ Error hierarchy covers authentication, rate limiting, validation, and generic provider errors

### OpenAI Provider Requirements
- ✅ Successfully sends requests to OpenAI Chat Completions API
- ✅ Handles system prompt as first message in conversation
- ✅ Maps `FormattedMessage[]` directly to OpenAI message format
- ✅ Implements retry logic with exponential backoff for transient failures
- ✅ Throws appropriate error types for 401 (auth), 429 (rate limit), and other failures
- ✅ Returns response content and usage metadata when available

### Anthropic Provider Requirements
- ✅ Successfully sends requests to Anthropic Messages API
- ✅ Passes system prompt as separate parameter (not in messages array)
- ✅ Merges consecutive same-role messages to meet Anthropic alternation requirements
- ✅ Handles max_tokens parameter appropriately
- ✅ Implements provider-specific error handling and retry logic
- ✅ Returns response content from first text block

### Mock Provider Requirements
- ✅ Returns configurable predefined responses without external API calls
- ✅ Supports different response patterns for testing scenarios
- ✅ Simulates realistic response timing and structure
- ✅ Enables deterministic testing of chat functionality
- ✅ Handles all input parameters but ignores for response generation

### Message Formatting Requirements
- ✅ Filters messages to only include those with `included=true`
- ✅ Excludes all system messages from LLM context
- ✅ User messages maintain 'user' role in formatted output
- ✅ Target agent's previous messages become 'agent' role
- ✅ Other agents' messages become 'user' role with agent name attribution
- ✅ Preserves chronological message order
- ✅ Handles empty message lists gracefully

### Service Integration Requirements
- ✅ `LlmService.generateResponse()` coordinates formatting and provider calls
- ✅ Provider factory creates correct provider instances based on `Provider` type
- ✅ Integration with existing `SystemPromptService` for agent context generation
- ✅ Proper dependency injection pattern following codebase conventions
- ✅ Comprehensive logging for debugging and monitoring

### Error Handling Requirements
- ✅ Provider failures don't crash entire application
- ✅ Each error type includes meaningful messages for troubleshooting
- ✅ Network timeouts handled with appropriate retry strategies
- ✅ Invalid API keys produce clear authentication error messages
- ✅ Rate limit errors include retry timing information
- ✅ Malformed responses handled gracefully with validation errors

## Technical Requirements

### Architecture Compliance
- All code resides in `packages/shared/src/services/llm/` directory structure
- Follows existing dependency injection patterns from codebase
- Uses existing logging infrastructure (`createLoggerSync`)
- Implements proper TypeScript types with Zod validation
- No platform-specific code - uses universal fetch API

### Performance Requirements
- Provider calls complete within 30 seconds (with timeout handling)
- Message formatting processes 1000+ messages efficiently
- Parallel provider calls don't block each other
- Memory usage remains reasonable for large conversation histories

### Security Requirements
- API keys never logged or exposed in error messages
- Input validation on all provider parameters
- Proper error sanitization before client exposure
- No execution of message content as code

## Implementation Guidance

### Directory Structure
```
packages/shared/src/services/llm/
├── interfaces/
│   ├── LlmProvider.ts
│   ├── LlmRequestParams.ts
│   ├── LlmResponse.ts
│   └── FormattedMessage.ts
├── providers/
│   ├── OpenAIProvider.ts
│   ├── AnthropicProvider.ts
│   └── MockProvider.ts
├── services/
│   ├── LlmService.ts
│   ├── MessageFormatterService.ts
│   └── LlmProviderFactory.ts
├── errors/
│   └── LlmProviderError.ts (with subclasses)
└── index.ts
```

### Core Interface Design

#### LlmProvider Interface
```typescript
// interfaces/LlmProvider.ts
export interface LlmProvider {
  sendMessage(params: LlmRequestParams): Promise<LlmResponse>;
}

// interfaces/LlmRequestParams.ts  
export interface LlmRequestParams {
  systemPrompt: string;
  messages: FormattedMessage[];
  config: LlmConfig;
  agentName: string; // For context attribution
}

// interfaces/FormattedMessage.ts
export interface FormattedMessage {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string; // For multi-agent context
}

// interfaces/LlmResponse.ts
export interface LlmResponse {
  content: string;
  metadata?: {
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
    };
  };
}
```

### Message Formatting Service Implementation

The core algorithm for multi-agent conversation handling:

```typescript
// services/MessageFormatterService.ts
import { Message, ConversationAgent } from '../../types';
import { FormattedMessage } from '../interfaces';

export class MessageFormatterService {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MessageFormatterService" } },
  });

  /**
   * Format messages for a specific target agent.
   * Key insight: All non-target-agent messages become 'user' messages,
   * only target agent's own messages become 'assistant' messages.
   */
  formatMessagesForAgent(
    messages: Message[],
    targetAgentId: string,
    conversationAgents: ConversationAgent[]
  ): FormattedMessage[] {
    // Filter to only included messages (system messages excluded)
    const includedMessages = messages.filter(
      m => m.included && m.role !== 'system'
    );
    
    return includedMessages.map(message => {
      // User messages become 'user' role
      if (message.role === 'user') {
        return {
          role: 'user',
          content: message.content
        };
      }
      
      // Agent messages
      if (message.conversation_agent_id === targetAgentId) {
        // Target agent's own messages become 'assistant'
        return {
          role: 'assistant', 
          content: message.content
        };
      } else {
        // Other agents' messages become 'user' with attribution
        const agentName = this.getAgentName(
          message.conversation_agent_id, 
          conversationAgents
        );
        return {
          role: 'user',
          content: `${agentName}: ${message.content}`,
          agentName
        };
      }
    });
  }

  private getAgentName(
    agentId: string | null, 
    conversationAgents: ConversationAgent[]
  ): string {
    if (!agentId) return 'Unknown Agent';
    
    const agent = conversationAgents.find(ca => ca.id === agentId);
    return agent ? `Agent-${agent.agent_id}` : 'Unknown Agent';
  }
}
```

### Provider Implementations

#### OpenAI Provider
```typescript
// providers/OpenAIProvider.ts
import OpenAI from 'openai';
import { LlmProvider, LlmRequestParams, LlmResponse } from '../interfaces';
import { LlmProviderError, LlmAuthenticationError, LlmRateLimitError } from '../errors';

export class OpenAIProvider implements LlmProvider {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "OpenAIProvider" } },
  });

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      const client = new OpenAI({
        apiKey: params.config.apiKey,
        baseURL: params.config.baseUrl
      });

      const messages = [
        { role: 'system' as const, content: params.systemPrompt },
        ...params.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const response = await client.chat.completions.create({
        model: params.config.model || 'gpt-4',
        messages,
        max_tokens: 4000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LlmProviderError('No content in OpenAI response');
      }

      return {
        content,
        metadata: {
          model: response.model,
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens
          } : undefined
        }
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new LlmAuthenticationError('Invalid OpenAI API key');
      }
      if (error.status === 429) {
        throw new LlmRateLimitError('OpenAI rate limit exceeded');
      }
      throw new LlmProviderError(`OpenAI API error: ${error.message}`);
    }
  }
}
```

#### Anthropic Provider
```typescript
// providers/AnthropicProvider.ts
import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider, LlmRequestParams, LlmResponse, FormattedMessage } from '../interfaces';
import { LlmProviderError, LlmAuthenticationError, LlmRateLimitError } from '../errors';

export class AnthropicProvider implements LlmProvider {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "AnthropicProvider" } },
  });

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      const client = new Anthropic({
        apiKey: params.config.apiKey,
        baseURL: params.config.baseUrl
      });

      // Anthropic requires alternating roles - merge consecutive same-role messages
      const mergedMessages = this.mergeConsecutiveRoles(params.messages);

      const response = await client.messages.create({
        model: params.config.model || 'claude-3-opus-20240229',
        system: params.systemPrompt, // System is separate in Anthropic
        messages: mergedMessages,
        max_tokens: 4000
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new LlmProviderError('Unexpected response format from Anthropic');
      }

      return {
        content: content.text,
        metadata: {
          model: response.model,
          usage: response.usage ? {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens
          } : undefined
        }
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new LlmAuthenticationError('Invalid Anthropic API key');
      }
      if (error.status === 429) {
        throw new LlmRateLimitError('Anthropic rate limit exceeded');
      }
      throw new LlmProviderError(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Merge consecutive same-role messages since Anthropic requires alternation
   */
  private mergeConsecutiveRoles(messages: FormattedMessage[]): FormattedMessage[] {
    const merged: FormattedMessage[] = [];
    
    for (const msg of messages) {
      if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
        merged[merged.length - 1].content += '\n\n' + msg.content;
      } else {
        merged.push({ ...msg });
      }
    }
    
    return merged;
  }
}
```

#### Mock Provider
```typescript
// providers/MockProvider.ts
import { LlmProvider, LlmRequestParams, LlmResponse } from '../interfaces';

export class MockProvider implements LlmProvider {
  private readonly responses = [
    "This is a mock response from the test provider.",
    "Another predefined response for testing purposes.",
    "Mock provider: I understand your request and here's my response.",
    "Testing response with some variety in content."
  ];
  
  private callCount = 0;

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    // Simulate realistic response time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    const responseIndex = this.callCount % this.responses.length;
    const content = `${params.agentName}: ${this.responses[responseIndex]}`;
    
    this.callCount++;
    
    return {
      content,
      metadata: {
        model: 'mock-model-v1',
        usage: {
          promptTokens: Math.floor(Math.random() * 100) + 50,
          completionTokens: Math.floor(Math.random() * 200) + 100
        }
      }
    };
  }
}
```

### Service Layer Implementation

#### LLM Service
```typescript
// services/LlmService.ts
import { Message, ConversationAgent, LlmConfig } from '../../types';
import { LlmProvider, LlmRequestParams } from '../interfaces';
import { MessageFormatterService } from './MessageFormatterService';
import { SystemPromptService } from '../systemPrompt';

export class LlmService {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmService" } },
  });

  constructor(
    private messageFormatter: MessageFormatterService,
    private systemPromptService: SystemPromptService,
    private providers: Map<Provider, LlmProvider>
  ) {}

  async generateResponse(
    conversationId: string,
    agentId: string,
    messages: Message[],
    conversationAgents: ConversationAgent[],
    agentConfig: AgentConfiguration,
    llmConfig: LlmConfig
  ): Promise<string> {
    try {
      this.logger.info('Generating response', { 
        conversationId, 
        agentId,
        provider: llmConfig.provider 
      });

      // Format messages for this specific agent
      const formattedMessages = this.messageFormatter.formatMessagesForAgent(
        messages,
        agentId,
        conversationAgents
      );

      // Generate system prompt
      const systemPrompt = await this.systemPromptService.generatePrompt(
        agentConfig.role,
        agentConfig.personality
      );

      // Get provider and send request
      const provider = this.providers.get(llmConfig.provider);
      if (!provider) {
        throw new LlmProviderError(`Unknown provider: ${llmConfig.provider}`);
      }

      const response = await provider.sendMessage({
        systemPrompt,
        messages: formattedMessages,
        config: llmConfig,
        agentName: agentConfig.name
      });

      this.logger.info('Response generated successfully', {
        conversationId,
        agentId,
        responseLength: response.content.length
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to generate response', error as Error, {
        conversationId,
        agentId
      });
      throw error;
    }
  }
}
```

#### Provider Factory
```typescript
// services/LlmProviderFactory.ts
import { Provider } from '../../types';
import { LlmProvider } from '../interfaces';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { MockProvider } from '../providers/MockProvider';

export class LlmProviderFactory {
  createProvider(provider: Provider): LlmProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic': 
        return new AnthropicProvider();
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  createMockProvider(): LlmProvider {
    return new MockProvider();
  }

  createAllProviders(): Map<Provider, LlmProvider> {
    const providers = new Map<Provider, LlmProvider>();
    providers.set('openai', new OpenAIProvider());
    providers.set('anthropic', new AnthropicProvider());
    return providers;
  }
}
```

### Error Handling Implementation

```typescript
// errors/LlmProviderError.ts
export class LlmProviderError extends Error {
  constructor(message: string, public readonly provider?: string) {
    super(message);
    this.name = 'LlmProviderError';
  }
}

export class LlmAuthenticationError extends LlmProviderError {
  constructor(message: string, provider?: string) {
    super(message, provider);
    this.name = 'LlmAuthenticationError';
  }
}

export class LlmRateLimitError extends LlmProviderError {
  constructor(message: string, provider?: string, public readonly retryAfter?: number) {
    super(message, provider);
    this.name = 'LlmRateLimitError';
  }
}

export class LlmValidationError extends LlmProviderError {
  constructor(message: string, provider?: string) {
    super(message, provider);
    this.name = 'LlmValidationError';
  }
}
```

### Integration with Chat Service

Example of how the ChatService will use the LLM system:

```typescript
// Integration example in ChatService
async sendMessage(conversationId: string, userMessage: string): Promise<void> {
  // Store user message
  await this.messageRepository.create({
    conversation_id: conversationId,
    role: MessageRole.USER,
    content: userMessage,
    included: true
  });

  // Get enabled agents
  const enabledAgents = await this.conversationAgentsRepository
    .getByConversation(conversationId)
    .then(agents => agents.filter(a => a.enabled));

  // Generate responses in parallel
  const responsePromises = enabledAgents.map(agent => 
    this.generateAgentResponse(conversationId, agent)
  );

  await Promise.allSettled(responsePromises);
}

private async generateAgentResponse(
  conversationId: string, 
  agent: ConversationAgent
): Promise<void> {
  try {
    const messages = await this.messageRepository.getByConversation(conversationId);
    const agentConfig = await this.getAgentConfiguration(agent.agent_id);
    const llmConfig = await this.getLlmConfig(agentConfig.llmConfigId);

    const response = await this.llmService.generateResponse(
      conversationId,
      agent.id,
      messages,
      await this.conversationAgentsRepository.getByConversation(conversationId),
      agentConfig,
      llmConfig
    );

    // Store agent response
    await this.messageRepository.create({
      conversation_id: conversationId,
      conversation_agent_id: agent.id,
      role: MessageRole.AGENT,
      content: response,
      included: true
    });
  } catch (error) {
    this.logger.error('Agent response failed', error as Error, {
      conversationId,
      agentId: agent.id
    });
    // Could store error message or retry logic here
  }
}
```

### Provider-Specific Handling Details

#### OpenAI Specifics
- System prompt becomes first message with 'system' role
- Direct mapping of FormattedMessage to OpenAI format
- No role alternation requirements
- Usage tracking via response.usage object

#### Anthropic Specifics  
- System prompt passed as separate `system` parameter
- Role alternation enforced - consecutive same-role messages must be merged
- Content returned in array format, extract first text block
- Different usage token field names (input_tokens/output_tokens)

#### Mock Provider Features
- Configurable response patterns for different test scenarios
- Realistic response timing simulation
- Usage metadata generation for testing
- No external dependencies or API calls

## Testing Requirements

### Unit Testing
- Message formatter with various conversation scenarios
- Each provider with mocked API responses
- Error handling for all failure modes
- Provider factory with different configuration types

### Integration Testing  
- End-to-end flow with MockProvider
- System prompt generation integration
- Error propagation through service layers
- Parallel provider execution scenarios

### Test Coverage Requirements
- 90%+ coverage on core business logic
- All error paths tested with appropriate scenarios
- Provider-specific API interaction patterns verified
- Message formatting edge cases covered

## Dependencies

### Internal Dependencies
- Existing `SystemPromptService` for agent context
- `Message` and `LlmConfig` types from current schema
- `ConversationAgent` type for agent metadata
- Database bridge and logging infrastructure

### External Dependencies
- OpenAI SDK for API integration
- Anthropic SDK for API integration  
- Standard HTTP client libraries (fetch API)
- Retry/backoff utilities for resilience

## Security Considerations

### API Key Protection
- Keys retrieved securely from existing configuration system
- No logging of sensitive credentials
- Proper error message sanitization

### Input Validation
- All provider parameters validated with Zod schemas
- Message content sanitized to prevent injection attacks
- Configuration validation before provider instantiation

### Network Security
- HTTPS-only communication with provider APIs
- Request/response size limits to prevent abuse
- Timeout controls for network resilience

## Performance Requirements

### Response Times
- Message formatting: < 100ms for typical conversations
- Provider API calls: 5-30 seconds depending on model complexity
- Factory instantiation: < 10ms per provider

### Resource Usage
- Memory usage scales linearly with conversation size
- No memory leaks from provider instances
- Efficient message filtering and transformation

### Scalability
- Support for multiple concurrent agent responses
- Efficient handling of long conversation histories
- Provider instances can be reused across requests

This feature provides the complete foundation for multi-provider LLM integration while maintaining clean architecture and comprehensive testing capabilities.