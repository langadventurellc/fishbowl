---
id: T-integrate-dynamicbehaviorsecti
title: Integrate DynamicBehaviorSections into PersonalityForm with optional
  dynamic props
status: open
priority: high
parent: F-dynamic-personality-form
prerequisites:
  - T-implement-dynamicbehaviorsecti
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T19:47:32.799Z
updated: 2025-08-27T19:47:32.799Z
---

Context

- We are replacing the behaviors area in PersonalityForm with a new dynamic component that renders sections/traits passed from the parent.
- External API of PersonalityForm should remain compatible for existing callers; PersonalityFormModal is currently the only caller.

Goal
Update PersonalityForm to optionally accept dynamic sections and a synchronous getShort function and to swap BehaviorSlidersSection with DynamicBehaviorSections when those props are provided.

File changes

- apps/desktop/src/components/settings/personalities/PersonalityForm.tsx (update)
- apps/desktop/src/components/settings/personalities/index.ts (ensure exports)
- apps/desktop/src/components/settings/personalities/**tests**/PersonalityForm.test.tsx (update tests to cover dynamic path)

Implementation requirements

- Add optional props to PersonalityForm (locally, without changing shared types):
  - `dynamicSections?: PersonalitySectionDef[]`
  - `dynamicGetShort?: (traitId: string, value: DiscreteValue) => string | undefined`
  - `defsLoading?: boolean`
  - `defsError?: boolean`
- Keep existing `CreatePersonalityFormProps` intact; define an internal props type that extends it with the optional fields.
- Rendering logic:
  - If `dynamicSections` and `dynamicGetShort` are provided, render `DynamicBehaviorSections` instead of `BehaviorSlidersSection`.
  - Pass `values={field.value}` and `onChange={(id, v) => field.onChange({...field.value, [id]: v})}` to maintain current RHF pattern.
  - Pass `isLoading={isSubmitting || isLoading || defsLoading}` and `isError={!!defsError}` down so interaction disables on load/error.
  - Otherwise, fall back to existing `BehaviorSlidersSection` to avoid breaking other flows during rollout.
- Preserve existing features:
  - Unsaved changes tracking via `useUnsavedChanges`
  - Zod validation
  - Default values behavior and dirty detection
  - Submit/cancel behavior

Testing (unit tests):

- Update/extend `PersonalityForm.test.tsx` to exercise the dynamic path:
  - When `dynamicSections` + `dynamicGetShort` are provided, the new component renders traits from sections, and slider updates propagate to form state via onChange.
  - Save button disabled when `defsError` is true.
  - Loading state disables sliders when `defsLoading` is true.
- Ensure existing tests still pass for the fallback legacy path (no dynamic props provided).

Acceptance criteria

- PersonalityForm compiles with added optional props and maintains compatibility
- Behavior area renders from `DynamicBehaviorSections` when dynamic props are passed
- All unit tests pass: existing plus new dynamic-path tests
- No IO occurs inside PersonalityForm; it only consumes passed-in sections/getShort

Security considerations

- No new IO; ensure trait IDs are used safely when composing prop IDs/labels via Dynamic component

Out of scope

- Loading personality definitions (handled in modal task)
- Removing the legacy BehaviorSlidersSection file (handled later)
