# Agent Model Configuration Specification

## Overview

The Model Configuration system enables agents to use different AI models from various providers. It provides a unified interface for managing different model APIs while maintaining provider-specific requirements through configuration.

## Architecture

### Model Provider Configuration

Models and providers are configured via JSON files to allow easy updates without code changes.

#### models.json Structure

```json
{
  "providers": {
    "openai": {
      "baseUrl": "https://api.openai.com/v1",
      "systemPromptStrategy": "system_role",
      "models": [
        {
          "id": "gpt-4-turbo-preview",
          "name": "GPT-4 Turbo",
          "contextWindow": 128000
        },
        {
          "id": "gpt-3.5-turbo",
          "name": "GPT-3.5 Turbo",
          "contextWindow": 16000
        }
      ]
    },
    "anthropic": {
      "baseUrl": "https://api.anthropic.com/v1",
      "systemPromptStrategy": "first_user_message",
      "models": [
        {
          "id": "claude-3-opus-20240229",
          "name": "Claude 3 Opus",
          "contextWindow": 200000
        },
        {
          "id": "claude-3-sonnet-20240229",
          "name": "Claude 3 Sonnet",
          "contextWindow": 200000
        }
      ]
    },
    "google": {
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
      "systemPromptStrategy": "system_role",
      "roleMapping": {
        "assistant": "model",
        "user": "user"
      },
      "models": [
        {
          "id": "gemini-1.5-pro",
          "name": "Gemini 1.5 Pro",
          "contextWindow": 1000000
        }
      ]
    }
  }
}
```

### System Prompt Strategies

- **`system_role`**: Provider supports system role in messages
- **`first_user_message`**: System prompt must be included as first user message
- **`user_prefix`**: System prompt prefixed to each user message

### Agent Model Configuration

Each agent stores its model selection and parameters:

```typescript
interface AgentModelConfig {
  provider: string; // "openai", "anthropic", etc.
  modelId: string; // "gpt-4-turbo-preview"
  parameters: {
    temperature?: number; // 0.0-2.0, default: 0.7
    maxTokens?: number; // Maximum response length
    topP?: number; // Nucleus sampling
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}
```

## Storage Architecture

### Database Schema (SQLite)

```sql
-- Conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,          -- Role name from role config
  personality TEXT NOT NULL,    -- JSON string of personality config
  model_config TEXT NOT NULL,   -- JSON string of model config
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  agent_id TEXT,               -- NULL for human messages
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### File Storage Structure

```
app-data/
├── config/
│   ├── models.json          # Model configurations (user-editable)
│   ├── agents.json          # Agent template configurations
│   └── preferences.json     # User preferences
├── data/
│   └── conversations.db     # SQLite database
└── logs/
    └── api-errors.log      # API error logging
```

## API Configuration

### Secure Storage

API keys are stored using platform's secure storage:

```typescript
interface APIConfiguration {
  openai?: { apiKey: string };
  anthropic?: { apiKey: string };
  google?: { apiKey: string };
  ollama?: { baseUrl: string }; // No API key needed
}
```

### Provider Integration

Uses Vercel AI SDK for unified interface across providers:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize providers with stored API keys
const providers = {
  openai: createOpenAI({ apiKey: getSecureApiKey("openai") }),
  anthropic: createAnthropic({ apiKey: getSecureApiKey("anthropic") }),
  google: createGoogleGenerativeAI({ apiKey: getSecureApiKey("google") }),
};
```

## Message Formatting

### Conversation Context Format

Messages in multi-agent conversations are prefixed with agent identification:

```
[Technical Advisor|Technical Advisor]: Based on the architecture requirements...
[Project Manager|Project Manager]: What's the estimated timeline?
[User]: Can we prioritize the authentication module?
```

### Provider Message Formatting

Based on the `systemPromptStrategy` in models.json:

```typescript
function formatMessages(
  provider: ProviderConfig,
  systemPrompt: string,
  messages: Message[],
): FormattedMessage[] {
  switch (provider.systemPromptStrategy) {
    case "system_role":
      return [{ role: "system", content: systemPrompt }, ...messages];

    case "first_user_message":
      const [first, ...rest] = messages;
      return [
        {
          role: "user",
          content: `${systemPrompt}\n\n${first.content}`,
        },
        ...rest,
      ];

    case "user_prefix":
      return messages.map((msg) => ({
        ...msg,
        content:
          msg.role === "user"
            ? `${systemPrompt}\n\n${msg.content}`
            : msg.content,
      }));
  }
}
```

## Context Window Management

### Token Counting

- Use tiktoken or similar library for token estimation
- Track conversation token count in memory
- Display warning when approaching model limits

### Basic Implementation (V1)

```typescript
interface ContextStatus {
  currentTokens: number;
  maxTokens: number;
  warningThreshold: 0.8; // Warn at 80% capacity
}
```

### Future Enhancement (V1.x)

- Automatic conversation summarization
- System LLM for utility tasks (summarization, context compression)
- Configurable context management strategies

## Error Handling

### API Errors

Display simple error messages to users:

- Rate limit exceeded
- Invalid API key
- Model not available
- Network connection issues

### Error Message Format

```typescript
interface APIError {
  provider: string;
  model: string;
  message: string;
  timestamp: Date;
}
```

## Implementation Notes

### Model Selection

- Agents select model at creation time
- No mid-conversation model switching
- Model availability validated against models.json

### Settings Management

- **API Keys**: Stored in system keychain via keytar
- **Model Configs**: Stored in user-editable JSON
- **Agent Templates**: Stored in JSON for reuse
- **User Preferences**: Stored in preferences.json

### Future Enhancements

- Local model support (Ollama) - V1.5
- OpenRouter integration
- Advanced token management
- Conversation export/import
- Model capability detection
- Cost tracking per conversation
