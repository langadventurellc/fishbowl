---
id: T-create-barrel-exports-for-llm
title: Create barrel exports for LLM service modules
status: open
priority: low
parent: F-llm-provider-system
prerequisites:
  - T-create-llm-provider-factory
  - T-implement-messageformatterserv
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T01:58:02.007Z
updated: 2025-08-29T01:58:02.007Z
---

# Create Barrel Exports for LLM Service Modules

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Creates clean import paths and organized exports following project conventions.

## Implementation Requirements

Create barrel export files to organize module exports:

### Files to Create:

1. **`packages/shared/src/services/llm/providers/index.ts`**
   - Export all provider implementations
   - Export factory function

2. **`packages/shared/src/services/llm/services/index.ts`**
   - Export MessageFormatterService

3. **`packages/shared/src/services/llm/index.ts`** (main barrel)
   - Re-export from all sub-modules
   - Provide clean import paths for consumers

### Export Structure:

**providers/index.ts:**

```typescript
export { OpenAIProvider } from "./OpenAIProvider";
export { AnthropicProvider } from "./AnthropicProvider";
export { MockProvider } from "./MockProvider";
export { createProvider, createMockProvider } from "../LlmProviderFactory";
```

**services/index.ts:**

```typescript
export { MessageFormatterService } from "./MessageFormatterService";
```

**Main index.ts:**

```typescript
export * from "./interfaces";
export * from "./errors";
export * from "./services";
export * from "./providers";
```

## Technical Approach

- Follow existing barrel export patterns in codebase
- Use consistent export naming conventions
- Group related exports logically
- Enable clean import syntax: `import { OpenAIProvider, createProvider } from '@fishbowl-ai/shared/services/llm'`

## Acceptance Criteria

- [ ] providers/index.ts exports all provider classes and factory
- [ ] services/index.ts exports MessageFormatterService
- [ ] Main index.ts re-exports all sub-modules
- [ ] Clean import paths work correctly
- [ ] No circular dependencies
- [ ] Consistent with existing project barrel export patterns
- [ ] TypeScript compilation passes

## Dependencies

- T-create-llm-provider-factory (factory to export)
- T-implement-messageformatterserv (service to export)

## Out of Scope

- Complex export configurations
- Conditional exports
- Package.json exports field configuration
