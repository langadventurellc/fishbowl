---
id: F-system-prompt-factory-template
title: System Prompt Factory & Template
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:04:12.070Z
updated: 2025-08-28T00:04:12.070Z
---

Purpose
Implement a shared system prompt factory that generates a model-ready system prompt string for a given agent, and ship a versioned template under desktop resources that is copied into user data at app startup (dev, packaged, and test). Personalities define dynamic behaviors; the final prompt must enumerate only behaviors present in the selected personality.

Scope

- Add `SystemPromptFactory` in shared: accepts a `PersistedAgentData` and resolves personality + role to construct the prompt via a template renderer.
- Introduce a system prompt template stored under desktop `resources/` and ensure it’s included in packaged builds and copied to user data on app start across environments.
- No UI components; only shared logic + desktop startup resource handling.

Key Components

- Shared prompt factory module (`packages/shared/src/prompts/system/…`):
  - `SystemPromptFactory.ts` (class with constructor DI and `createSystemPrompt` method)
  - `systemPromptTypes.ts` (DI interfaces and render input types)
  - `systemPromptRenderer.ts` (token replacement and behavior rendering)
  - `index.ts` (barrel)
  - Behavior:
    - Uses `agent.personality` and `agent.role` to resolve full personality and role via injected resolvers.
    - Never imports app repositories directly; DI only.
    - Uses logger from `@fishbowl-ai/shared` for traceability.

- Template and renderer:
  - Template file created from `docs/specifications/system-prompt-template-prototype.txt` as a versioned text template (e.g., `system-prompt.txt`) with placeholders `{{agentName}}`, `{{roleName}}`, `{{personalityName}}`, `{{behaviors}}`, `{{tools}}`, `{{constraints}}`, `{{memoryGuidance}}`.
  - Behaviors are dynamically rendered from the personality’s `behaviors` (keys + values). If `agent.personalityBehaviors` provides overrides, reflect those values.
  - Renderer omits empty sections cleanly.

- Desktop resource inclusion + startup copy:
  - Place template under `apps/desktop/system-prompt.txt`.
  - Ensure packaged app includes `**` via electron-builder `extraResources` in `apps/desktop/package.json`.
  - Add `src/electron/startup/ensureSystemPromptTemplate.ts` mirroring `ensurePersonalityDefinitions.ts` to:
    - Locate the template from app resources (dev vs packaged paths).
    - Copy to `app.getPath('userData')/system-prompts/` on app start.
    - Overwrite if missing or source is newer (mtime or embedded version header).
    - Works in dev, packaged, and test modes.
  - Use shared `logger`.

Data Model Notes

- `PersistedAgentData`: `id`, `name`, `model`, `role` (id), `personality` (id), optional `systemPrompt`, optional `personalityBehaviors` (per-agent values), timestamps.
- `PersistedPersonalityData`: `name`, `behaviors` (record<string, number>), `customInstructions`.
- `PersistedRoleData`: `name`, `description`, `systemPrompt` (role-specific instructions).

Acceptance Criteria

- Shared factory:
  - `SystemPromptFactory` constructed with resolvers; `createSystemPrompt(agent)` returns a full prompt string.
  - Output includes agent name, role name/description or role system prompt guidance, personality name/custom instructions.
  - Behavior section lists only defined behaviors; reflects agent-level overrides when present.
  - Optional sections (tools, constraints, memory guidance) render only when provided; otherwise omitted.
  - Single-responsibility files; barrel export.
  - No app-specific imports; all platform access injected via constructor.

- Template & renderer:
  - Template stored in `apps/desktop/system-prompt.txt` and included in packaged artifacts.
  - Renderer replaces all placeholders; behaviors render deterministically (stored order or alphabetized consistently).
  - No dangling tokens when data is missing.

- Startup copy:
  - On desktop app start, the template exists in `userData/system-prompts/`.
  - Works across dev, packaged, and test modes.
  - Idempotent with clear logs.

- Quality & architecture:
  - Follows monorepo rules: business logic in shared; platform copying in desktop main.
  - Passes `pnpm quality` and `pnpm type-check`.
  - `pnpm build:libs` succeeds after adding types/interfaces.

Detailed Implementation Guidance

- Shared (`packages/shared`):
  - Files:
    - `SystemPromptFactory.ts` (class-based DI)
    - `systemPromptTypes.ts` (DI and render types)
    - `systemPromptRenderer.ts` (pure rendering)
    - `index.ts` (barrel)
  - Behavior rendering format: `- <BehaviorKey>: <Value>`; if override: `- <BehaviorKey>: <BaseValue> (override: <AgentValue>)`.

- Desktop (`apps/desktop`):
  - Add `system-prompt.txt` from prototype with tokens for dynamic parts.
  - Update `package.json` `extraResources` to include the folder.
  - Add `src/electron/startup/ensureSystemPromptTemplate.ts` and wire into startup.

Testing Requirements

- Shared (Jest):
  - Construct `SystemPromptFactory` with mock resolvers; verify `createSystemPrompt(agent)` output.
  - Behavior list shows only defined behaviors and respects overrides.
  - Deterministic output for identical inputs.
- Desktop:
  - Unit test any pure path helpers if extracted; otherwise provide manual verification steps.

Security Considerations

- No secrets in templates.
- Validate file paths; write only to `userData`.

Performance Requirements

- Prompt generation <5ms typical.
- Startup copy is idempotent, minimal overhead.

Dependencies

- None. Repositories remain in app layer; shared uses constructor-injected resolvers.

Completion Definition

- Class-based `SystemPromptFactory` available from `@fishbowl-ai/shared` with unit coverage.
- Template shipped and present in user data after startup in dev/packaged/test.
- All quality checks pass; shared libs build successfully.
