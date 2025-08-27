---
id: T-remove-legacy-behaviorsliderss
title: Remove legacy BehaviorSlidersSection usage and clean up exports/tests
status: open
priority: low
parent: F-dynamic-personality-form
prerequisites:
  - T-load-personality-definitions
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T19:47:59.801Z
updated: 2025-08-27T19:47:59.801Z
---

Context

- The dynamic behaviors component supersedes `BehaviorSlidersSection`.

Goal
Remove legacy component usage and clean up exports and tests to reflect the new dynamic behaviors system.

Files

- apps/desktop/src/components/settings/personalities/index.ts (update)
- apps/desktop/src/components/settings/personalities/BehaviorSlidersSection.tsx (delete)
- apps/desktop/src/components/settings/personalities/**tests**/ (remove or update any tests referencing BehaviorSlidersSection)

Implementation requirements

- Ensure no imports of `BehaviorSlidersSection` remain (search the repo within `apps/desktop`).
- Update `index.ts` to stop exporting `BehaviorSlidersSection` and to export `DynamicBehaviorSections` if needed by other modules.
- Remove the legacy file `BehaviorSlidersSection.tsx` if it is no longer referenced.
- Update any tests that reference the legacy component to use the new dynamic component (if such tests exist in desktop app).

Testing

- Run `pnpm quality` and `pnpm test` from the repo root to ensure no references or type errors remain and unit tests pass.

Acceptance criteria

- No references or exports of `BehaviorSlidersSection` remain
- Index exports reflect the new component
- All tests pass and no type errors

Security considerations

- None (pure code deletion and export changes)

Out of scope

- Any additional refactoring of PersonalityForm or modal behaviors beyond the removal
