---
id: T-implement-openai-provider
title: Implement OpenAI provider with fetch-based API client
status: done
priority: high
parent: F-llm-provider-system
prerequisites:
  - T-create-core-llm-provider
  - T-create-llm-provider-error
affectedFiles:
  packages/shared/src/services/llm/providers/OpenAIProvider.ts:
    Implemented complete OpenAI API provider class with fetch-based HTTP
    requests, fixed endpoint and authentication configuration, system message
    prepending, sampling parameter application, robust response parsing, and
    comprehensive error handling using LlmProviderError
  packages/shared/src/services/llm/providers/__tests__/OpenAIProvider.test.ts:
    Created comprehensive test suite with 22 unit tests covering successful API
    calls, HTTP error handling, missing content scenarios, error message
    sanitization, and request structure validation - all tests pass with 100%
    coverage of acceptance criteria
log:
  - >-
    Successfully implemented OpenAI provider with fetch-based API client as
    specified. The OpenAIProvider class implements the LlmProvider interface
    with proper error handling, response parsing, and adherence to OpenAI API
    specifications. Key features include:


    ✅ Uses fetch API (no SDK dependencies) for platform compatibility

    ✅ Fixed endpoint URL (ignores baseUrl config per spec)

    ✅ Fixed Authorization Bearer header format (ignores useAuthHeader config per
    spec)

    ✅ Properly prepends system message to FormattedMessage array

    ✅ Applies all sampling parameters (temperature, top_p, max_tokens)

    ✅ Extracts content string from choices[0].message.content

    ✅ Comprehensive error handling with LlmProviderError

    ✅ Sanitized error messages (no API key exposure)

    ✅ 22 comprehensive unit tests covering all scenarios with 100% pass rate

    ✅ All quality checks pass (linting, formatting, TypeScript compilation)


    The implementation follows established patterns from AnthropicProvider while
    respecting OpenAI-specific requirements. All acceptance criteria met
    including successful API calls, HTTP error handling, missing content
    scenarios, error message sanitization, and request structure validation.
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
