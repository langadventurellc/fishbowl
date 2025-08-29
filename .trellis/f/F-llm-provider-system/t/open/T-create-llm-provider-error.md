---
id: T-create-llm-provider-error
title: Create LLM provider error handling classes
status: open
priority: high
parent: F-llm-provider-system
prerequisites:
  - T-create-core-llm-provider
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T01:56:20.001Z
updated: 2025-08-29T01:56:20.001Z
---

# Create LLM Provider Error Handling Classes

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Implements simplified error mapping for provider HTTP/API failures.

## Implementation Requirements

Create error handling in `packages/shared/src/services/llm/errors/`:

### Files to Create:

1. `LlmProviderError.ts` - Main error class
2. `index.ts` - Barrel export

### Error Class Specifications:

**LlmProviderError Class:**

- Extends standard `Error`
- Constructor: `(message: string, provider?: string)`
- Property: `provider?: string` (optional provider identification)
- Property: `name: string = "LlmProviderError"`
- Clear, sanitized error messages (no API keys or sensitive config)

## Technical Approach

- Follow existing error class patterns in the codebase
- Examine existing error classes in `packages/shared/src/types/*/errors/` for consistency
- Keep error messages user-friendly and sanitized
- Support optional provider name for debugging context

## Acceptance Criteria

- [ ] LlmProviderError class created with proper inheritance
- [ ] Constructor accepts message and optional provider name
- [ ] Error name property set correctly
- [ ] No sensitive information exposed in error messages
- [ ] Barrel export includes error class
- [ ] TypeScript compilation passes

## Dependencies

- T-create-core-llm-provider (for directory structure context)

## Out of Scope

- Retry/backoff error types (future feature)
- Rate limit specific error classes
- Detailed error taxonomy
