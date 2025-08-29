---
id: T-implement-openai-provider
title: Implement OpenAI provider with fetch-based API client
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
created: 2025-08-29T01:57:14.341Z
updated: 2025-08-29T01:57:14.341Z
---

# Implement OpenAI Provider with Fetch-Based API Client

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Implements OpenAI API integration using fetch (no SDK) for platform compatibility.

## Implementation Requirements

Create `packages/shared/src/services/llm/providers/OpenAIProvider.ts`:

### Core Functionality:

**OpenAIProvider Class:**

- Implements `LlmProvider` interface
- Uses fetch for all HTTP requests (no SDK dependencies)
- Fixed endpoint: `https://api.openai.com/v1/chat/completions`
- Ignores `config.baseUrl` and `config.useAuthHeader` (per spec)

### API Integration:

- **Authentication**: Fixed `Authorization: Bearer ${apiKey}` header
- **Message Format**: System message first, then FormattedMessage[] directly
- **Model Selection**: Use `params.model` from agent settings
- **Sampling**: Apply temperature, top_p, max_tokens from params.sampling
- **Response Parsing**: Extract `content` from first choice message

### Request Structure:

```json
{
  "model": "params.model",
  "messages": [
    {"role": "system", "content": "params.systemPrompt"},
    ...params.messages
  ],
  "temperature": params.sampling.temperature,
  "top_p": params.sampling.topP,
  "max_tokens": params.sampling.maxTokens
}
```

### Error Handling:

- Catch HTTP errors and convert to `LlmProviderError`
- Handle missing content in response
- Sanitize error messages (no API key exposure)
- Include provider name "openai" in errors

## Technical Approach

- Use native `fetch` API for HTTP requests
- Follow OpenAI API v1 chat completions specification
- Implement proper JSON parsing and error checking
- Map HTTP status codes to meaningful error messages
- Use existing `LlmProviderError` for consistent error handling

## Acceptance Criteria

- [ ] OpenAIProvider class implements LlmProvider interface
- [ ] Uses fetch (no SDK dependencies)
- [ ] Fixed endpoint URL (ignores baseUrl config)
- [ ] Fixed Authorization header format (ignores useAuthHeader config)
- [ ] Prepends system message to FormattedMessage array
- [ ] Uses model from params.model (not config)
- [ ] Applies all sampling parameters correctly
- [ ] Extracts content string from API response
- [ ] Handles HTTP errors with LlmProviderError
- [ ] Handles missing content scenarios
- [ ] Error messages are sanitized (no API key exposure)
- [ ] Unit tests cover:
  - [ ] Successful API calls and response parsing
  - [ ] HTTP error handling scenarios
  - [ ] Missing content error handling
  - [ ] Sampling parameter application
  - [ ] Request structure validation
  - [ ] Error message sanitization
- [ ] TypeScript compilation passes

## Dependencies

- T-create-core-llm-provider (LlmProvider interface)
- T-create-llm-provider-error (error handling)

## Out of Scope

- Custom base URL support (per spec)
- Authorization header options (per spec)
- Streaming support (future feature)
- Retry logic (future feature)
