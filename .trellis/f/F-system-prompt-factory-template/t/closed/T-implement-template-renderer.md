---
id: T-implement-template-renderer
title: Implement template renderer with dynamic behaviors
status: done
priority: medium
parent: F-system-prompt-factory-template
prerequisites:
  - T-scaffold-shared-system-prompt
affectedFiles:
  packages/shared/src/prompts/system/systemPromptRenderer.ts:
    Implemented complete
    renderSystemPrompt function with token replacement, behavior rendering with
    override support, and whitespace cleanup
  packages/shared/src/prompts/system/systemPromptTypes.ts: Updated
    SystemPromptRenderData to use BehaviorRenderData type for behaviors field
  packages/shared/src/prompts/system/BehaviorRenderData.ts:
    Created new interface
    for behavior render data with personality behaviors and agent overrides
  packages/shared/src/prompts/system/index.ts: Added BehaviorRenderData export to barrel file
  packages/shared/src/prompts/system/__tests__/systemPromptRenderer.test.ts:
    Created comprehensive test suite with 17 tests covering all functionality
    requirements
log:
  - Implemented template renderer with dynamic behavior rendering. The
    renderSystemPrompt function replaces all template tokens safely, renders
    behaviors alphabetically with override support, and cleans up empty
    sections. All 17 unit tests pass, covering token replacement, behavior
    rendering, edge cases, and deterministic output.
schema: v1.0
childrenIds: []
created: 2025-08-28T00:23:38.078Z
updated: 2025-08-28T00:23:38.078Z
---

Context
Build the pure rendering function that consumes a text template and structured data and emits a finalized system prompt string. Behaviors must be rendered dynamically from the selected personality and agent overrides.

References

- Feature spec (factory shape and placeholders)
- Template placeholders: {{agentSystemPrompt}}, {{agentName}}, {{roleName}}, {{roleDescription}}, {{roleSystemPrompt}}, {{personalityName}}, {{personalityCustomInstructions}}, {{behaviors}}
- Personality model: `PersistedPersonalityData.behaviors: Record<string, number>`; agent overrides: `PersistedAgentData.personalityBehaviors`

Implementation Requirements

- File: `packages/shared/src/prompts/system/systemPromptRenderer.ts`
- Export a single function: `renderSystemPrompt(template: string, data: SystemPromptRenderData): string`
- Replace tokens safely:
  - Unknown/missing tokens => remove section headers and avoid dangling tokens
  - Behaviors: render deterministically (alphabetical by key). Format: "- <Key>: <Value>"; if override present, use "- <Key>: <Base> (override: <Agent>)"
- Keep implementation dependency-free (no external templating libraries)
- Include thorough unit tests (Jest):
  - Replaces all placeholders with provided values
  - Omits sections when data missing (no leftover `{{...}}`)
  - Renders behavior overrides correctly
  - Produces stable output for same inputs

Technical Approach

- Use simple token map and `.replace` with RegExp for each token
- For sections like behaviors, generate text block first, then inject
- Add small helpers (internal) for formatting lists and for safe section removal

Acceptance Criteria

- Function compiles and is pure
- All unit tests pass locally
- No app-specific imports; only shared types

Security & Performance

- No unbounded string growth; trim excessive whitespace when removing sections
- O(n) in template length and behaviors count; acceptable for <5ms typical

Out of Scope

- Reading the template file from disk (done in desktop and/or factory integration)
