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

# LLM Provider System Implementation (Revised)

## Purpose and Scope

Create a minimal, correct, and extensible LLM provider abstraction for the desktop app that:
- Formats multi-agent conversation history into provider-specific message arrays.
- Invokes provider SDKs/APIs from the Electron main process only (no renderer, no mobile).
- Returns a plain string completion (no streaming yet), with simple, clear error mapping.

Out of scope for this feature:
- Rate limiting, retries, and backoff strategies (future feature).
- Detailed usage/metrics metadata collection.
- Mobile or renderer implementations (explicitly future concerns).
- How the system prompt is generated. This feature only accepts a `systemPrompt: string`.

## Architecture and Placement

- Shared (business logic + contracts): `packages/shared/src/services/llm/`
  - Interfaces and request/response types
  - Message formatting service (pure, testable)
  - Factory interface and minimal helpers
- Desktop main process (provider implementations only): `apps/desktop/src/main/llm/`
  - `OpenAIProvider` using OpenAI SDK
  - `AnthropicProvider` using Anthropic SDK
  - `MockProvider` for tests/dev

Rationale: SDKs and HTTP stacks vary by platform and add bundle weight/compat issues in browser/RN. Keeping provider implementations in main follows our platform abstraction rules and keeps shared package platform-agnostic.

## Core Contracts (Shared)

- `LlmProvider` interface: single responsibility, no retries, no streaming yet.
- `LlmRequestParams`:
  - `systemPrompt: string` (already constructed elsewhere)
  - `model: string` (comes from persisted agent settings, not LlmConfig)
  - `messages: FormattedMessage[]` (see formatting rules below)
  - `config: LlmConfig` (auth + baseUrl + useAuthHeader)
  - `sampling?: { temperature?: number; topP?: number; maxTokens?: number }` (derived from personality outside this feature)
  - `stream?: false | undefined` (reserved for future streaming, ignored for now)
- `FormattedMessage`:
  - `{ role: 'user' | 'assistant'; content: string; agentName?: string }`
  - Note: internal Message.role uses `'user' | 'agent' | 'system'`; we only map to `'assistant'` at the API boundary.
- `LlmResponse`:
  - `{ content: string }` (no extra metadata for now)

No Zod schemas are required in this feature for these contracts (avoid over-engineering); rely on TypeScript types and existing upstream validation.

## Message Formatting (Shared)

`MessageFormatterService` (pure, no IO):
- Inputs:
  - `messages: Message[]` (from repository)
  - `targetAgentId: string` (conversation_agent_id for the agent being invoked)
  - `agentNameByConversationAgentId: Record<string, string>` (caller-provided map for attribution)
- Rules:
  - Include only `included === true` messages.
  - Exclude all `role === 'system'` messages.
  - Preserve chronological order.
  - Map internal roles to provider roles for context:
    - User messages → `{ role: 'user', content }`
    - Messages from `targetAgentId` → `{ role: 'assistant', content }`
    - Messages from other agents → `{ role: 'user', content: `${displayName}: ${content}` }`
- Output: `FormattedMessage[]`

Note: Name resolution is provided by the caller. This avoids coupling to repositories/settings inside shared formatting logic.

## Provider Implementations (Desktop Main Only)

### OpenAIProvider (apps/desktop/src/main/llm/OpenAIProvider.ts)
- Uses OpenAI SDK.
- Ignores `config.useAuthHeader` and `config.baseUrl` (not relevant for OpenAI in our app today).
- Sends messages with first element as `{ role: 'system', content: systemPrompt }` followed by `FormattedMessage[]` mapped directly.
- Uses `params.model` (from agent settings), not from `LlmConfig`.
- Applies optional sampling if present: `temperature`, `top_p`, `max_tokens`.
- Returns `content` string; throws simple error types on failure.

### AnthropicProvider (apps/desktop/src/main/llm/AnthropicProvider.ts)
- Uses Anthropic SDK.
- Respects `config.baseUrl` and `config.useAuthHeader` (Anthropic only). Use standard SDK header semantics for API key.
- Passes `systemPrompt` as `system` (separate field).
- Merges consecutive same-role messages to satisfy role alternation.
- Uses `params.model` from agent settings.
- Applies optional sampling if present: `temperature`, `top_p`, `max_tokens`.
- Returns `content` string from first text block; throws simple error types on failure.

### MockProvider (apps/desktop/src/main/llm/MockProvider.ts)
- Deterministic, minimal string responses for tests/dev.
- No external calls; ignores sampling.

## Factory and Wiring

- Simple switch-based factory is sufficient (and preferred) for now.
- Location: `apps/desktop/src/main/llm/LlmProviderFactory.ts`.
- Supported providers: `'openai' | 'anthropic'`. Future additions (e.g., Google) will add a new case.
- DI pattern: Renderer or services layer requests main-process orchestration to invoke the provider with shared `LlmProvider` contract.

## Service Orchestration

A thin orchestration service will live in desktop main (e.g., `apps/desktop/src/main/llm/LlmService.ts`) that:
- Accepts `conversationId`, `target conversation_agent_id`, `messages`, `agentName map`, `agent model`, `LlmConfig`, and optional `sampling`.
- Uses shared `MessageFormatterService` to produce `FormattedMessage[]`.
- Invokes the chosen provider with `{ systemPrompt, model, messages, config, sampling }`.
- Returns a string completion to be persisted as a new message with role `'agent'`.

Note: This feature does not dictate how `systemPrompt` is created. It must be provided as a string.

## Error Handling (Simplified)

- Map provider/HTTP errors to a single `LlmProviderError` with a clear message string; include provider name when helpful.
- No retry/backoff or rate-limit-specific classes in this feature.
- Do not log API keys or sensitive config. Keep error messages sanitized.

## Acceptance Criteria

- Shared contracts and formatter implemented as specified above.
- OpenAI and Anthropic providers implemented in desktop main using their SDKs.
- Providers use `params.model` (agent settings) and `config` only for auth/baseUrl.
- Anthropic provider respects `baseUrl` and `useAuthHeader` (OpenAI ignores both).
- Optional sampling is passed through when provided.
- No streaming yet; `stream` param accepted but ignored.
- Basic error mapping; no retries.
- Unit tests for `MessageFormatterService` (happy paths + alternation merging coverage via Anthropic mapping logic).
- MockProvider supports deterministic test cases.

## Adjacent Changes and Consistency

- Conversation agent enablement: Upstream chat orchestration should filter by `enabled` (migrations already done). `is_active` is reserved for soft-delete semantics. The provider system assumes the caller has already selected enabled agents.
- Role terminology: Persisted messages keep `'agent'` role; only provider-facing arrays use `'assistant'`.
- No performance targets in this feature.

## Future Extensions (Non-blocking, noted for design continuity)

- Streaming support: Preserve `stream` param for a future feature; likely return a controller or accept callbacks for partial deltas.
- Additional providers (e.g., Google): Add a new switch case and implementation in desktop main, reusing shared contracts/formatter.
- Retry/backoff, rate limit handling, and richer error taxonomy.
- Optional usage/metrics metadata if we decide to surface it in UI or logs.
