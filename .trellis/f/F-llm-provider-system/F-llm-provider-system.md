---
id: F-llm-provider-system
title: LLM Provider System Implementation
status: done
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/services/llm/interfaces/LlmProvider.ts: Core LLM provider interface with single sendMessage method
  packages/shared/src/services/llm/interfaces/LlmRequestParams.ts:
    Request parameters interface with system prompt, model, messages, config,
    and sampling
  packages/shared/src/services/llm/interfaces/FormattedMessage.ts: Provider-formatted message interface with user/assistant roles
  packages/shared/src/services/llm/interfaces/LlmResponse.ts: Simple provider response interface with content string
  packages/shared/src/services/llm/interfaces/index.ts: Barrel export file for all LLM interfaces
  packages/shared/src/services/llm/errors/LlmProviderError.ts:
    Created main error class extending Error with message and optional provider
    properties
  packages/shared/src/services/llm/errors/index.ts: Created barrel export for the error classes
  packages/shared/src/services/llm/providers/AnthropicProvider.ts:
    Created complete Anthropic API provider implementation with fetch-based HTTP
    requests, message alternation handling, configurable auth headers, base URL
    normalization, and comprehensive error handling
  packages/shared/src/services/llm/providers/__tests__/AnthropicProvider.test.ts:
    Created comprehensive test suite with 25 unit tests covering base URL
    normalization, authentication header selection, message alternation
    handling, API request/response parsing, error handling, and edge cases
  packages/shared/eslint.config.cjs: Added fetch as global for Node.js 18+
    environments to resolve linting errors in provider implementations
  packages/shared/src/services/llm/services/MessageFormatterService.ts:
    Implemented core MessageFormatterService class with formatMessages method
    for converting conversation messages to provider format with role mapping
    and name attribution
  packages/shared/src/services/llm/services/index.ts: Created barrel export file for services directory
  packages/shared/src/services/llm/services/__tests__/MessageFormatterService.test.ts:
    "Created comprehensive test suite with 16 unit tests covering all formatting
    rules: inclusion filtering, system exclusion, role mapping, name prefixing,
    order preservation, and edge cases"
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
  packages/shared/src/services/llm/providers/MockProvider.ts:
    Created MockProvider
    class implementing LlmProvider interface with deterministic rotating
    responses, realistic timing simulation, and proper error-free operation for
    testing purposes
  packages/shared/src/services/llm/factory/createProvider.ts: Main factory
    function with switch-based provider instantiation supporting openai and
    anthropic providers with error handling for unknown types
  packages/shared/src/services/llm/factory/createMockProvider.ts: Mock provider factory function for testing and development scenarios
  packages/shared/src/services/llm/factory/index.ts: Barrel export file for factory functions following project conventions
  packages/shared/src/services/llm/factory/__tests__/createProvider.test.ts:
    Comprehensive test suite covering provider creation, error handling, type
    safety, and factory behavior with 23 unit tests
  packages/shared/src/services/llm/factory/__tests__/createMockProvider.test.ts:
    Complete test coverage for mock provider factory with 16 unit tests covering
    functionality, behavior, purity, and testing utility validation
  packages/shared/src/services/llm/providers/index.ts: Created barrel export for
    all provider classes (OpenAIProvider, AnthropicProvider, MockProvider) and
    factory functions (createProvider, createMockProvider)
  packages/shared/src/services/llm/index.ts: Created main barrel export
    re-exporting all LLM sub-modules (interfaces, errors, services, providers)
    for clean import paths
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-barrel-exports-for-llm
  - T-create-core-llm-provider
  - T-create-llm-provider-error
  - T-create-llm-provider-factory
  - T-create-mockprovider-for
  - T-implement-anthropic-provider
  - T-implement-messageformatterserv
  - T-implement-openai-provider
created: 2025-08-29T00:06:15.858Z
updated: 2025-08-29T00:06:15.858Z
---

# LLM Provider System Implementation (Revised)

## Purpose and Scope

Create a minimal, correct, and extensible LLM provider abstraction that:

- Formats multi-agent conversation history into provider-specific message arrays.
- Uses fetch/HTTP (no SDKs) for all provider calls to support custom headers and base URLs across platforms.
- Returns a plain string completion (no streaming yet), with simple, clear error mapping.

Out of scope for this feature:

- Rate limiting, retries, and backoff strategies (future feature).
- Detailed usage/metrics metadata collection.
- How this is invoked from renderer/main/mobile. Wiring/invocation will be designed later; make no assumptions.
- How the system prompt is generated. This feature only accepts a `systemPrompt: string`.

## Architecture and Placement

- Shared (contracts + pure logic + implementations): `packages/shared/src/services/llm/`
  - Contracts: interfaces and request/response types (one export per file with a barrel `index.ts`).
  - Message formatting service (pure, testable) for provider-ready arrays.
  - Provider implementations using fetch (no SDKs): `OpenAIProvider`, `AnthropicProvider`, `MockProvider`.
  - Simple switch-based factory and minimal helpers.

Rationale: Using fetch avoids SDK constraints, enables custom headers/base URLs, and keeps implementations platform-agnostic for future React Native use. Providers live in shared to maximize reuse; higher-level wiring in apps remains out of scope here.

## Core Contracts (Shared)

- `LlmProvider` interface: single responsibility, no retries, no streaming yet.
  - Method: `sendMessage(params: LlmRequestParams): Promise<LlmResponse>`
- `LlmRequestParams`:
  - `systemPrompt: string` (already constructed elsewhere)
  - `model: string` (from persisted agent settings, not LlmConfig)
  - `messages: FormattedMessage[]` (see formatting rules below)
  - `config: LlmConfig` (auth + baseUrl + useAuthHeader)
  - `sampling: { temperature: number; topP: number; maxTokens: number }` (always provided by caller; derived from personality outside providers)
  - `stream?: false | undefined` (reserved for future streaming, ignored for now)
- `FormattedMessage`:
  - `{ role: 'user' | 'assistant'; content: string }`
  - Note: internal Message.role uses `'user' | 'agent' | 'system'`; we only map to `'assistant'` at the provider boundary.
- `LlmResponse`:
  - `{ content: string }` (no extra metadata for now)

No Zod schemas are required for these contracts (avoid over-engineering); rely on TypeScript types and existing upstream validation.

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
  - Anthropic alternation precondition helpers are provider-specific; the formatter does not enforce alternation but must not introduce provider-violating structures intentionally.
- Output: `FormattedMessage[]`

Additional explicit rule for provider requirements:

- These providers will not be called with zero messages (precondition guaranteed by caller).
- For Anthropic, if the first formatted message is not a `user` role, the provider will inject a leading empty `user` message before sending (see Anthropic provider behavior below).

Note: Name resolution is provided by the caller to avoid coupling to repositories/settings inside shared formatting logic.

## Provider Implementations (Shared via fetch)

Location for all providers: `packages/shared/src/services/llm/providers/`

### OpenAIProvider

- Uses fetch (no SDK).
- Endpoint: fixed to `https://api.openai.com/v1/chat/completions` for now.
- Ignores `config.baseUrl` and `config.useAuthHeader` (UI does not expose OpenAI base URL yet; header form is fixed as `Authorization: Bearer ...`).
- Sends messages with first element as `{ role: 'system', content: systemPrompt }` followed by `FormattedMessage[]` mapped directly.
- Uses `params.model` (from agent settings), not from `LlmConfig`.
- Applies optional sampling if present: `temperature`, `top_p`, `max_tokens`.
- Returns `content` string; throws simple error types on failure.

### AnthropicProvider

- Uses fetch (no SDK).
- Endpoint: defaults to `https://api.anthropic.com/v1/messages`, overridable via `config.baseUrl`.
- Base URL normalization: Strip trailing slashes and `/v1` from `config.baseUrl`, then append `/v1/messages`.
- Auth header selection:
  - If `config.useAuthHeader === true`: `Authorization: Bearer ${apiKey}`.
  - Else: `x-api-key: ${apiKey}`.
- Passes `systemPrompt` as `system` (separate field).
- Ensures Anthropic alternation contract:
  - Merge consecutive same-role messages.
  - If the first message is not `user`, inject a leading empty `user` message.
  - If the last message is `assistant`, inject a trailing empty `user` message.
- Uses `params.model` from agent settings.
- Applies required sampling: `temperature`, `top_p`, `max_tokens`.
- Returns `content` string from first text block; throws simple error types on failure.

### MockProvider

- Deterministic, minimal string responses for tests/dev.
- No external calls; ignores sampling.

## Factory and Wiring

- Simple switch-based factory is sufficient (and preferred) for now.
- Location: `packages/shared/src/services/llm/LlmProviderFactory.ts`.
- Supported providers: `'openai' | 'anthropic'`. Future additions (e.g., Google) add a new case.
- Invocation/wiring (renderer/main/mobile) is out of scope for this feature; do not assume how it will be called.

## Service Orchestration

Orchestration (e.g., selecting target agent, building name map, extracting sampling from personality, and invoking providers) will be defined by a higher-level system and is out of scope here. Providers and formatter are designed to be composable by that future layer. This feature does not dictate how `systemPrompt` is created; it must be provided as a string.

## Error Handling (Simplified)

- Map provider/HTTP errors to a single `LlmProviderError` with a clear message string; include provider name when helpful.
- No retry/backoff or rate-limit-specific classes in this feature.
- Do not log API keys or sensitive config. Keep error messages sanitized.

## Acceptance Criteria

- Shared contracts and formatter implemented as specified above.
- OpenAI and Anthropic providers implemented in shared using fetch (no SDKs).
- Providers use `params.model` (agent settings) and `config` only for auth/baseUrl.
- Anthropic provider respects `baseUrl` and `useAuthHeader`; OpenAI ignores both for now.
- Required sampling parameters are always provided (providers do not derive sampling themselves).
- No streaming yet; `stream` param accepted but ignored.
- Basic error mapping; no retries.
- Unit tests:
  - `MessageFormatterService`: inclusion filtering, exclusion of system, role mapping, name prefixing for non-target agents, order preservation.
  - `AnthropicProvider`: merges consecutive same-role messages; injects leading empty `user` when first is not `user`; injects trailing empty `user` when last is `assistant`; normalizes `baseUrl`; honors `useAuthHeader`; parses first text block.
  - `OpenAIProvider`: prepends system message; ignores `baseUrl`/`useAuthHeader`; passes sampling through.
  - `MockProvider`: deterministic responses.

## Adjacent Changes and Consistency

- Conversation agent enablement: Upstream orchestration should filter by `enabled`. `is_active` is reserved for soft-delete semantics. The provider system assumes the caller has already selected enabled agents.
- Role terminology: Persisted messages keep `'agent'` role; only provider-facing arrays use `'assistant'`.
- Code quality: one export per file; add local barrels (`index.ts`) in both `services/llm/` and `services/llm/providers/`.
- No performance targets in this feature.

## Future Extensions (Non-blocking, noted for design continuity)

- Streaming support: Preserve `stream` param; future feature may return a controller or accept partial delta callbacks.
- Additional providers (e.g., Google): Add a new switch case and implementation in shared, reusing contracts/formatter.
- Retry/backoff, rate limit handling, and richer error taxonomy.
- Optional usage/metrics metadata if we decide to surface it in UI or logs.

## Sampling Notes

- Sampling parameters (`temperature`, `topP`, `maxTokens`) are always provided by the caller, typically derived from personality settings. Providers do not fetch or compute these values.
- A future, separate utility may map personality options to sampling (e.g., `services/llm/sampling/personalityToSampling.ts`), but this mapping is outside the scope of this feature. Providers and their contracts require these values to be provided.

## Implementation Examples

### Core Interface Definitions

```typescript
// interfaces/LlmProvider.ts
export interface LlmProvider {
  sendMessage(params: LlmRequestParams): Promise<LlmResponse>;
}

// interfaces/LlmRequestParams.ts
export interface LlmRequestParams {
  systemPrompt: string;
  model: string;
  messages: FormattedMessage[];
  config: LlmConfig;
  sampling: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  stream?: false | undefined; // Reserved for future streaming
}

// interfaces/FormattedMessage.ts
export interface FormattedMessage {
  role: "user" | "assistant";
  content: string;
}

// interfaces/LlmResponse.ts
export interface LlmResponse {
  content: string;
}

// errors/LlmProviderError.ts
export class LlmProviderError extends Error {
  constructor(
    message: string,
    public readonly provider?: string,
  ) {
    super(message);
    this.name = "LlmProviderError";
  }
}
```

### Message Formatter Service

```typescript
// services/MessageFormatterService.ts
import { Message } from "../../types";
import { FormattedMessage } from "../interfaces";

export class MessageFormatterService {
  /**
   * Format messages for a specific target agent.
   * Key insight: All non-target-agent messages become 'user' messages,
   * only target agent's own messages become 'assistant' messages.
   */
  formatMessages(
    messages: Message[],
    targetAgentId: string,
    agentNameByConversationAgentId: Record<string, string>,
  ): FormattedMessage[] {
    // Filter to only included messages and exclude system messages
    const includedMessages = messages.filter(
      (m) => m.included && m.role !== "system",
    );

    return includedMessages.map((message) => {
      // User messages become 'user' role
      if (message.role === "user") {
        return {
          role: "user",
          content: message.content,
        };
      }

      // Agent messages
      if (message.conversation_agent_id === targetAgentId) {
        // Target agent's own messages become 'assistant'
        return {
          role: "assistant",
          content: message.content,
        };
      } else {
        // Other agents' messages become 'user' with name prefixed
        const displayName = message.conversation_agent_id
          ? agentNameByConversationAgentId[message.conversation_agent_id] ||
            "Unknown Agent"
          : "Unknown Agent";
        return {
          role: "user",
          content: `${displayName}: ${message.content}`,
        };
      }
    });
  }
}
```

### OpenAI Provider Implementation

```typescript
// providers/OpenAIProvider.ts
import { LlmProvider, LlmRequestParams, LlmResponse } from "../interfaces";
import { LlmProviderError } from "../errors";

export class OpenAIProvider implements LlmProvider {
  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    const url = "https://api.openai.com/v1/chat/completions";

    // Build messages with system prompt first
    const messages = [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ];

    const requestBody = {
      model: params.model,
      messages,
      temperature: params.sampling.temperature,
      top_p: params.sampling.topP,
      max_tokens: params.sampling.maxTokens,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new LlmProviderError("No content in OpenAI response", "openai");
      }

      return { content };
    } catch (error) {
      if (error instanceof LlmProviderError) {
        throw error;
      }
      throw new LlmProviderError(
        `OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "openai",
      );
    }
  }
}
```

### Anthropic Provider Implementation

```typescript
// providers/AnthropicProvider.ts
import {
  LlmProvider,
  LlmRequestParams,
  LlmResponse,
  FormattedMessage,
} from "../interfaces";
import { LlmProviderError } from "../errors";

const ANTHROPIC_API_VERSION = "2023-06-01";

export class AnthropicProvider implements LlmProvider {
  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    const url = this.buildApiUrl(params.config.baseUrl);

    // Ensure alternating roles and proper first/last message handling
    let processedMessages = this.mergeConsecutiveRoles(params.messages);

    // Ensure first message is 'user'
    if (processedMessages.length > 0 && processedMessages[0].role !== "user") {
      processedMessages = [{ role: "user", content: "" }, ...processedMessages];
    }

    // Ensure last message is 'user'
    if (
      processedMessages.length > 0 &&
      processedMessages[processedMessages.length - 1].role === "assistant"
    ) {
      processedMessages = [...processedMessages, { role: "user", content: "" }];
    }

    const requestBody = {
      model: params.model,
      system: params.systemPrompt,
      messages: processedMessages,
      temperature: params.sampling.temperature,
      top_p: params.sampling.topP,
      max_tokens: params.sampling.maxTokens,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "anthropic-version": ANTHROPIC_API_VERSION,
    };

    // Auth header selection based on config
    if (params.config.useAuthHeader) {
      headers["Authorization"] = `Bearer ${params.config.apiKey}`;
    } else {
      headers["x-api-key"] = params.config.apiKey;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const textContent = data.content?.find((c: any) => c.type === "text");

      if (!textContent?.text) {
        throw new LlmProviderError(
          "No text content in Anthropic response",
          "anthropic",
        );
      }

      return { content: textContent.text };
    } catch (error) {
      if (error instanceof LlmProviderError) {
        throw error;
      }
      throw new LlmProviderError(
        `Anthropic API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "anthropic",
      );
    }
  }

  /**
   * Build the API URL with proper base URL normalization
   */
  private buildApiUrl(baseUrl?: string): string {
    const normalizedBase = baseUrl || "https://api.anthropic.com";
    // Strip trailing slashes and /v1 path
    const cleanBase = normalizedBase.replace(/\/+$/, "").replace(/\/v1$/, "");
    return `${cleanBase}/v1/messages`;
  }

  /**
   * Merge consecutive same-role messages since Anthropic requires alternation
   */
  private mergeConsecutiveRoles(
    messages: FormattedMessage[],
  ): FormattedMessage[] {
    const merged: FormattedMessage[] = [];

    for (const msg of messages) {
      if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
        merged[merged.length - 1].content += "\n\n" + msg.content;
      } else {
        merged.push({ ...msg });
      }
    }

    return merged;
  }
}
```

### Mock Provider Implementation

```typescript
// providers/MockProvider.ts
import { LlmProvider, LlmRequestParams, LlmResponse } from "../interfaces";

export class MockProvider implements LlmProvider {
  private readonly responses = [
    "This is a mock response from the test provider.",
    "Another predefined response for testing purposes.",
    "Mock provider: I understand your request and here's my response.",
    "Testing response with some variety in content.",
  ];

  private callCount = 0;

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    // Simulate realistic response time
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 500),
    );

    const responseIndex = this.callCount % this.responses.length;
    const content = this.responses[responseIndex];

    this.callCount++;

    return { content };
  }
}
```

### Provider Factory

```typescript
// LlmProviderFactory.ts
import { Provider } from "../../types";
import { LlmProvider } from "./interfaces";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { MockProvider } from "./providers/MockProvider";

export function createProvider(provider: Provider): LlmProvider {
  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function createMockProvider(): LlmProvider {
  return new MockProvider();
}
```
