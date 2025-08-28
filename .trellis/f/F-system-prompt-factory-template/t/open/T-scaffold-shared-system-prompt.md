---
id: T-scaffold-shared-system-prompt
title: Scaffold shared system prompt module
status: open
priority: medium
parent: F-system-prompt-factory-template
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:23:29.544Z
updated: 2025-08-28T00:23:29.544Z
---

Context
Parent feature: F-system-prompt-factory-template (System Prompt Factory & Template)
Goal: Create the shared module structure to host the factory, types, renderer, and barrel exports in `@fishbowl-ai/shared`.

References

- Feature spec in Trellis (this parent)
- Shared package conventions: one main export per file; use barrel index
- Logger usage: `createLoggerSync` from `@fishbowl-ai/shared`

Implementation Requirements

- Add folder: `packages/shared/src/prompts/system/`
- Add files (empty implementations + TODOs permitted, but compile-valid):
  - `SystemPromptFactory.ts` (export a class placeholder)
  - `systemPromptTypes.ts` (define DI interfaces and render input shape)
  - `systemPromptRenderer.ts` (export a pure function placeholder)
  - `index.ts` (barrel exporting the above)
- Ensure exports are aligned with repo style (no multi-class exports per file).
- Add minimal unit test to confirm module exports are wired (import succeeds and types are present). Use existing Jest setup for shared.

Technical Approach

- Create types:
  - `SystemPromptResolvers` with `resolvePersonality`, `resolveRole`
  - `SystemPromptRenderData` shape with fields anticipated by renderer: `agentSystemPrompt`, `agentName`, `roleName`, `roleDescription`, `roleSystemPrompt`, `personalityName`, `personalityCustomInstructions`, `behaviors`
- `SystemPromptFactory` class stub:
  - Constructor accepts `resolvers: SystemPromptResolvers` and optional logger
  - Method signature `createSystemPrompt(agent: PersistedAgentData): Promise<string>`; return a placeholder string for now (to be implemented in later tasks)
- `systemPromptRenderer.ts` exports `renderSystemPrompt(template: string, data: SystemPromptRenderData): string` stub

Acceptance Criteria

- New module files exist with correct paths and named exports.
- `pnpm type-check` passes for shared.
- Jest test imports `SystemPromptFactory` and `renderSystemPrompt` from `@fishbowl-ai/shared` and asserts they are defined.
- No app-specific imports in shared.

Security & Performance

- No runtime behavior yet; ensure no side effects on import.

Out of Scope

- Actual rendering logic, DI usage, or template I/O (covered by later tasks).
