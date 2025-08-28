---
id: F-system-prompt-factory-template
title: System Prompt Factory & Template
status: done
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/system-prompt.txt: Created new system prompt template file with
    dynamic placeholders and version header
  apps/desktop/package.json: Added system-prompt.txt to extraResources array in
    electron-builder configuration
  resources/system-prompt.txt: Moved from apps/desktop/ to follow existing resource pattern
  apps/desktop/src/electron/startup/ensureSystemPromptTemplate.ts:
    Created new startup module that copies system-prompt.txt from resources to
    userData/system-prompts/ with mtime comparison and proper error handling
  apps/desktop/src/electron/startup/shouldCopyFile.ts: Created extracted helper
    function for file mtime comparison logic to enable unit testing
  apps/desktop/src/electron/main.ts: Added import and call to
    ensureSystemPromptTemplate in initializeApplication function
  apps/desktop/src/electron/__tests__/shouldCopyFile.test.ts:
    "Added comprehensive
    unit tests for shouldCopy helper covering all scenarios: missing dest, newer
    source, older source, same mtime, and error conditions"
  packages/shared/src/prompts/system/SystemPromptFactory.ts: Created
    SystemPromptFactory class with DI constructor accepting resolvers and
    optional logger; Enhanced SystemPromptFactory class with complete
    createSystemPrompt implementation and constructor accepting template
    parameter
  packages/shared/src/prompts/system/SystemPromptResolvers.ts:
    Created SystemPromptResolvers interface defining personality and role
    resolver methods
  packages/shared/src/prompts/system/systemPromptTypes.ts: Created
    SystemPromptRenderData interface with all required template placeholder
    fields; Updated SystemPromptRenderData to use BehaviorRenderData type for
    behaviors field
  packages/shared/src/prompts/system/systemPromptRenderer.ts: Created
    renderSystemPrompt function stub for template token replacement; Implemented
    complete renderSystemPrompt function with token replacement, behavior
    rendering with override support, and whitespace cleanup
  packages/shared/src/prompts/system/index.ts: Created barrel file exporting all
    module components; Added BehaviorRenderData export to barrel file
  packages/shared/src/prompts/index.ts: Created prompts barrel file
  packages/shared/src/index.ts: Added prompts export to main shared package barrel
  packages/shared/src/prompts/system/BehaviorRenderData.ts:
    Created new interface
    for behavior render data with personality behaviors and agent overrides
  packages/shared/src/prompts/system/__tests__/systemPromptRenderer.test.ts:
    Created comprehensive test suite with 17 tests covering all functionality
    requirements
  packages/shared/src/prompts/system/__tests__/SystemPromptFactory.test.ts:
    Created comprehensive unit test suite with 12 tests covering all
    functionality requirements including mocking, validation, and edge cases
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-electron-startup
  - T-author-desktop-system-prompt
  - T-implement-systempromptfactory
  - T-implement-template-renderer
  - T-include-template-in-packaged
  - T-scaffold-shared-system-prompt
created: 2025-08-28T00:04:12.070Z
updated: 2025-08-28T00:04:12.070Z
---

Purpose
Implement a shared system prompt factory that generates a model-ready system prompt string for a given agent, and ship a versioned template under desktop resources that is copied into user data at app startup (dev, packaged, and test). Personalities define dynamic behaviors; the final prompt must enumerate only behaviors present in the selected personality.

Scope

- Add `SystemPromptFactory` in shared: accepts a `PersistedAgentData` and resolves personality + role to construct the prompt via a template renderer.
- Introduce a system prompt template stored under desktop `resources/` and ensure it's included in packaged builds and copied to user data on app start across environments.
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
  - Template file created from `docs/specifications/system-prompt-template-prototype.txt` as a versioned text template (e.g., `system-prompt.txt`) with placeholders `{{agentSystemPrompt}}`, `{{agentName}}`, `{{roleName}}`, `{{roleDescription}}`, `{{roleSystemPrompt}}`, `{{personalityName}}`, `{{personalityCustomInstructions}}`, `{{behaviors}}`.
  - Behaviors are dynamically rendered from the personality's `behaviors` (keys + values).
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
  - Output includes agent system prompt, agent name, role name/description and role system prompt guidance, personality name and custom instructions.
  - Behavior section lists only defined behaviors
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
