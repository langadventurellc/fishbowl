---
id: T-optimize-personalityslider-re
title: Optimize PersonalitySlider re-renders and add usage docs (with tests)
status: open
priority: low
parent: F-dynamic-personality-slider
prerequisites:
  - T-add-metadata-description
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T18:52:54.720Z
updated: 2025-08-27T18:52:54.720Z
---

Overview:
Polish the PersonalitySlider by minimizing re-renders using React.memo and stable callbacks, validating prop types and defaults, and adding succinct usage documentation. Include a lightweight unit test to guard against unnecessary re-renders when unrelated props change.

Context:

- Component path: `apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx`
- Tests path: `apps/desktop/src/components/settings/personalities/__tests__/PersonalitySlider.test.tsx`

Specific implementation requirements:

- Wrap the component with `React.memo` and ensure props are comparably shallow so consumers can pass stable references.
- Memoize internal handlers with `useCallback` and computations with `useMemo` where it clearly reduces re-renders (avoid overuse).
- Provide sensible default props (e.g., `disabled = false`) and keep prop names consistent with existing slider usage patterns.
- Add top-of-file JSDoc describing props and behavior; include a short code example.
- Optional: add a `README.md` in the personalities component folder with a usage snippet and notes on discrete values.

Testing requirements:

- Add a test that renders the component, then re-renders with the same `value` and a new unrelated parent state to ensure `onChange` is not re-bound and no unexpected updates occur (can assert handler identity or use a render count helper).
- Ensure all previous tests continue to pass.

Acceptance criteria:

- Measurably fewer re-renders during rapid interactions (validated in unit test via render count or mock assertions).
- Clear JSDoc (and optional README) present with usage example.
- `pnpm quality` passes and type checks succeed.

Security considerations:

- No new behaviors; documentation only and memoization.

Out of scope for this task:

- Any feature changes to ticks, descriptions, or announcements.
- Replacing existing sliders elsewhere.
