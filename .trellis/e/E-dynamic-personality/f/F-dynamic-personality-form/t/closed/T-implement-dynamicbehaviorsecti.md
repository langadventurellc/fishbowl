---
id: T-implement-dynamicbehaviorsecti
title: Implement DynamicBehaviorSections component (behaviors-only, IO-free)
  with unit tests
status: done
priority: high
parent: F-dynamic-personality-form
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/DynamicBehaviorSections.tsx:
    Created new dynamic behaviors component that renders personality sections
    and traits using PersonalitySlider. Supports loading/error states,
    accessibility features, and performance optimization with React.memo.
  apps/desktop/src/components/settings/personalities/PersonalitySection.tsx:
    Created reusable section component with collapsible behavior, sessionStorage
    persistence, and optimized onChange handlers for trait interactions.
  apps/desktop/src/components/settings/personalities/__tests__/DynamicBehaviorSections.test.tsx:
    Created comprehensive unit tests covering 19 test cases including basic
    rendering, trait interactions, collapsible behavior, loading/error states,
    edge cases, and accessibility features. All tests passing.
log:
  - Successfully implemented DynamicBehaviorSections component (behaviors-only,
    IO-free) with comprehensive unit tests. Created dynamic personality sections
    system that renders sections and traits using PersonalitySlider components.
    Treats Big Five like any other section with no special-casing. Includes
    collapsible behavior with session persistence, loading/error states, and
    full accessibility support. All 19 unit tests passing and quality checks
    (lint, format, type-check) pass.
schema: v1.0
childrenIds: []
created: 2025-08-27T19:47:06.208Z
updated: 2025-08-27T19:47:06.208Z
---

Context

- Feature: Dynamic Personality Form System (behaviors-only scope). We are replacing the hardcoded BehaviorSlidersSection with a dynamic section-driven component while keeping PersonalityForm as the owning form.
- Decision: Scope B (behaviors-only). The new component will not perform IO; it renders based on sections and helpers passed from the parent/container.
- Loading location: Decision A. PersonalityFormModal will load personality definitions and provide props to the form/component.
- Existing files:
  - apps/desktop/src/components/settings/personalities/BehaviorSlidersSection.tsx (to be replaced)
  - apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx (reused)
  - packages/shared/src/types/personality/PersonalitySectionDef.ts and PersonalityTraitDef.ts (types for sections/traits)

Goal
Create a new dynamic behaviors component that:

- Renders personality sections and their traits using `PersonalitySlider`
- Treats Big Five like any other section (no special-casing)
- Accepts definitions and “getShort” synchronously from parent
- Does no IO/IPC inside the component
- Preserves collapsible behavior and session persistence
- Integrates with existing form via `values` and `onChange(behaviorId, value)` signature

File paths

- apps/desktop/src/components/settings/personalities/DynamicBehaviorSections.tsx (new)
- apps/desktop/src/components/settings/personalities/PersonalitySection.tsx (new)
- apps/desktop/src/components/settings/personalities/**tests**/DynamicBehaviorSections.test.tsx (new)

Implementation requirements

- Props interface (local):
  - `sections: PersonalitySectionDef[]`
  - `getShort: (traitId: string, value: DiscreteValue) => string | undefined`
  - `values: Record<string, DiscreteValue>`
  - `onChange: (traitId: string, value: DiscreteValue) => void`
  - `disabled?: boolean`
  - `isLoading?: boolean` (when true, render a lightweight skeleton/placeholder for sections; sliders disabled)
  - `isError?: boolean` (when true, render an inline error message and disable interactions)
  - `className?: string`
- Rendering:
  - Map over `sections` in order; for each, render a collapsible section with header and optional description.
  - Inside each section, map traits (use `trait.name` as label, `trait.id` as field key).
  - For each trait, render `PersonalitySlider` with:
    - `traitId`, `label`, `value` from `values[trait.id] ?? 40` (default 40)
    - `onChange` calls parent `onChange(trait.id, newValue)`
    - `shortText` via `getShort(trait.id, currentValue)`
    - `disabled` propagated
  - Persist expanded/collapsed state per-section in `sessionStorage` using a stable key, e.g. `personality-section-${section.id}-expanded`.
  - Keep interactions IO-free; all data supplied via props.
- Accessibility:
  - Section headers associated with content via aria-controls/aria-expanded
  - Sliders retain full ARIA from `PersonalitySlider`
  - Loading state conveyed to screen readers (e.g., aria-busy on container)
- Performance:
  - Use `React.memo` for section and slider rows where appropriate
  - Use `useCallback` for per-trait onChange closures

Testing (unit tests co-located under **tests**):

- Renders provided sections and traits in order; Big Five not special-cased
- Defaults to 40 for traits missing from `values`
- Calls `onChange(traitId, value)` when a slider changes
- Uses `getShort` to render the short description text below sliders
- Collapsible behavior persists expanded state across re-renders (simulate sessionStorage)
- Loading state: shows placeholders and disables sliders
- Error state: shows inline error and disables Save by signalling via disabled prop

Acceptance criteria

- New component exists at the specified path and compiles without type errors
- All tests for the new component pass (`pnpm test`)
- No IO/IPC within the component; uses only props for data
- Big Five traits render as a normal section with no special handling
- Collapsible state persisted per-section using sessionStorage

Security considerations

- Validate trait/section IDs used in DOM attributes (safely interpolate)
- Do not trust external input for HTML; do not dangerouslySetInnerHTML

Out of scope

- Wiring into PersonalityForm or Modal (handled in separate tasks)
- Deleting the old `BehaviorSlidersSection.tsx` file
