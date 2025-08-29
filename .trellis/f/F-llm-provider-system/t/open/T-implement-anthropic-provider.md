---
id: T-implement-anthropic-provider
title: Implement Anthropic provider with alternation handling and configurable auth
status: open
priority: high
parent: F-llm-provider-system
prerequisites:
  - T-create-core-llm-provider
  - T-create-llm-provider-error
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T01:57:32.633Z
updated: 2025-08-29T01:57:32.633Z
---

# Implement Anthropic Provider with Alternation Handling and Configurable Auth

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Implements Anthropic API integration with proper message alternation and flexible authentication.

## Implementation Requirements

Create `packages/shared/src/services/llm/providers/AnthropicProvider.ts`:

### Core Functionality:

**AnthropicProvider Class:**

- Implements `LlmProvider` interface
- Uses fetch for all HTTP requests (no SDK dependencies)
- Configurable base URL with normalization
- Flexible authentication header selection

### Base URL Handling:

- Default: `https://api.anthropic.com/v1/messages`
- Custom: Normalize `config.baseUrl` by:
  - Strip trailing slashes and `/v1` path
  - Append `/v1/messages`
- Examples:
  - `https://custom.api.com/` → `https://custom.api.com/v1/messages`
  - `https://custom.api.com/v1` → `https://custom.api.com/v1/messages`

### Authentication:

- If `config.useAuthHeader === true`: `Authorization: Bearer ${apiKey}`
- Else: `x-api-key: ${apiKey}`

### Message Processing (Anthropic Alternation Requirements):

1. **Merge Consecutive Roles**: Combine same-role messages with `\n\n` separator
2. **First Message Fix**: If first message is not 'user', inject empty 'user' message at start
3. **Last Message Fix**: If last message is 'assistant', append empty 'user' message at end

### API Integration:

- **System Prompt**: Use separate `system` field (not in messages array)
- **API Version**: Include `anthropic-version: 2023-06-01` header
- **Sampling**: Apply temperature, top_p, max_tokens from params.sampling
- **Response Parsing**: Extract text content from first text block

### Request Structure:

```json
{
  "model": "params.model",
  "system": "params.systemPrompt",
  "messages": [...processedMessages],
  "temperature": params.sampling.temperature,
  "top_p": params.sampling.topP,
  "max_tokens": params.sampling.maxTokens
}
```

## Technical Approach

- Implement helper methods for base URL normalization and message processing
- Use proper Anthropic API v1 message format specification
- Handle complex message alternation requirements systematically
- Implement flexible authentication header logic
- Use existing `LlmProviderError` for consistent error handling

## Acceptance Criteria

- [ ] AnthropicProvider class implements LlmProvider interface
- [ ] Base URL normalization works correctly for all input formats
- [ ] Authentication header selection based on useAuthHeader config
- [ ] Merges consecutive same-role messages properly
- [ ] Injects leading empty 'user' message when needed
- [ ] Appends trailing empty 'user' message when needed
- [ ] Uses separate system field (not in messages)
- [ ] Applies all sampling parameters correctly
- [ ] Extracts text content from response blocks
- [ ] Handles HTTP errors with LlmProviderError
- [ ] Unit tests cover:
  - [ ] Base URL normalization scenarios
  - [ ] Authentication header selection
  - [ ] Message alternation fixes (leading/trailing/consecutive)
  - [ ] Successful API calls and response parsing
  - [ ] HTTP error handling
  - [ ] Missing content error handling
  - [ ] System prompt separation
- [ ] TypeScript compilation passes

## Dependencies

- T-create-core-llm-provider (LlmProvider interface)
- T-create-llm-provider-error (error handling)

## Out of Scope

- Streaming support (future feature)
- Retry logic (future feature)
- Advanced response parsing (images, tools)
