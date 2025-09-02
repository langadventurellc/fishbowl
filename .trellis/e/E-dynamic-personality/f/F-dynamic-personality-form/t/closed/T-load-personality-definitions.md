---
id: T-load-personality-definitions
title: Load personality definitions in PersonalityFormModal and pass dynamic props
status: done
priority: medium
parent: F-dynamic-personality-form
prerequisites:
  - T-integrate-dynamicbehaviorsecti
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx:
    "Enhanced PersonalityFormModal with personality definitions loading: Added
    state management for sections, loading, and error states. Instantiated
    PersonalityDefinitionsClient and implemented async loading on modal open
    with proper cleanup. Built synchronous dynamicGetShort function using nested
    Maps for trait-to-value lookups. Added accessibility announcements for
    loading/error state changes. Passed new dynamic props (dynamicSections,
    dynamicGetShort, defsLoading, defsError) to PersonalityForm component. Added
    proper imports for PersonalitySectionDef, DiscreteValue, and
    PersonalityDefinitionsClient."
log:
  - Enhanced PersonalityFormModal to load personality section definitions on
    modal open, manage loading/error states, and pass dynamic props to
    PersonalityForm. Implemented PersonalityDefinitionsClient instantiation with
    proper state management, built synchronous dynamicGetShort function backed
    by in-memory maps for O(1) lookups, and added comprehensive accessibility
    support with screen reader announcements for loading/error states. The modal
    now handles definition loading failures gracefully by disabling form
    interactions, and all quality checks pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-27T19:47:49.158Z
updated: 2025-08-27T19:47:49.158Z
---

Context

- Decision: Load personality definitions in the modal (renderer) using PersonalityDefinitionsClient.
- The behaviors component requires synchronous `getShort` and section definitions without performing IO.

Goal
Enhance `PersonalityFormModal` to load personality section definitions once on open, manage loading/error states, and pass the following to `PersonalityForm`: `dynamicSections`, `dynamicGetShort`, `defsLoading`, `defsError`.

Files

- apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx (update)
- apps/desktop/src/renderer/services/personalityDefinitionsClient.ts (use, not modify)

Implementation requirements

- Instantiate or reuse a `PersonalityDefinitionsClient` in the modal.
- On modal open:
  - set local state: `defsLoading=true`, `defsError=false`;
  - call `client.getDefinitions()`; on success set `sections` from `definitions.sections`; on failure set `defsError=true`.
  - finally set `defsLoading=false`.
- Build a synchronous `dynamicGetShort` function backed by in-memory maps:
  - After loading definitions, compute `Map<string, Map<DiscreteValue, string | undefined>>` for short descriptions.
  - Provide `dynamicGetShort = (id, value) => maps.get(id)?.get(value)`.
- Pass the new props to `PersonalityForm`:
  - `dynamicSections={sections}`
  - `dynamicGetShort={dynamicGetShort}`
  - `defsLoading={defsLoading}`
  - `defsError={defsError}`
- Disable submit when `defsError` is true (PersonalityForm already enforces via props per previous task).
- Accessibility: Announce loading and error state changes to screen readers via existing `announceToScreenReader` utility if easily hooked; otherwise ensure visible text communicates state.

Testing

- Extend/adjust modal-level tests minimally (if present) or provide guidance for manual verification if modal unit tests are not established.
- Ensure that opening the modal triggers definitions load and that errors disable interactions (verified through the form’s disabled Save and component state).

Acceptance criteria

- Modal loads definitions and passes dynamic props to PersonalityForm
- When loading, behaviors area is disabled and shows placeholder state; when error, behaviors area is disabled and Save is disabled
- No IO happens inside PersonalityForm or the dynamic component

Security considerations

- Handle and log errors without leaking stack traces to UI
- No direct DOM injection from loaded data

Out of scope

- Deleting legacy component files
- Cross-modal caching or global prefetching (can be a future enhancement)
