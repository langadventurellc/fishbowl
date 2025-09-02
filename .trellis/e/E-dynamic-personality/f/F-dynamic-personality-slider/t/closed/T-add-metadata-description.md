---
id: T-add-metadata-description
title: Add metadata description display and ARIA valued text to
  PersonalitySlider (with tests)
status: done
priority: medium
parent: F-dynamic-personality-slider
prerequisites:
  - T-add-discrete-tick-marks-and
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx:
    Extended PersonalitySliderProps interface with shortText and getShort props;
    Added description resolution logic with fallback to 'No description
    available'; Implemented description rendering below slider with truncation
    styling; Wired ARIA attributes including aria-valuetext using resolved
    description and aria-describedby pointing to description element
log:
  - Enhanced PersonalitySlider component with metadata description display and
    comprehensive ARIA support. Added shortText and getShort props for flexible
    description sourcing, implemented description resolution logic with graceful
    fallbacks, and wired proper ARIA attributes (aria-valuetext,
    aria-describedby) for accessibility. Description renders below slider with
    truncation styling for responsive layouts. All quality checks pass with
    clean linting and type checking.
schema: v1.0
childrenIds: []
created: 2025-08-27T18:52:14.711Z
updated: 2025-08-27T18:52:14.711Z
---

Overview:
Extend PersonalitySlider to display the current value’s short description and wire core ARIA attributes for accessible labeling. Support either a provided `shortText` string prop or a synchronous `getShort(traitId, value)` resolver from the parent. Include fallbacks when no description is available. Add unit tests.

Context:

- Component path: `apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx`
- Discrete values: 0,20,40,60,80,100

Specific implementation requirements:

- Props additions:
  - `shortText?: string`
  - `getShort?: (traitId: string, value: DiscreteValue) => string | undefined`
- Description behavior:
  - Resolve description via `shortText` if provided; otherwise call `getShort(traitId, value)`.
  - Fallback to generic text (e.g., "No description available") when undefined/empty.
  - Render description below the slider with proper spacing; truncate gracefully on narrower layouts using Tailwind utilities (e.g., `truncate`, `line-clamp-1` if available).
- ARIA:
  - `aria-valuetext` reflects the resolved short description.
  - Ensure `aria-label` or `aria-labelledby` uses the `label` prop and associates the visible label element.
  - `aria-describedby` references the description element’s id.
- Maintain controlled behavior from prior tasks; no IO/IPC.

Technical approach:

1. Compute `resolvedShort = shortText ?? getShort?.(traitId, value) ?? fallback`.
2. Add a `descriptionId` and apply it to the description container, wiring `aria-describedby` on the slider.
3. Keep all description content as plain text; do not render HTML.

Testing requirements:

- Unit tests in `__tests__/PersonalitySlider.test.tsx`:
  - When `shortText` is provided, renders and updates `aria-valuetext` accordingly.
  - When `getShort` is provided, description resolves correctly for each discrete value.
  - When neither provided, fallback text renders and is referenced by `aria-describedby`.
  - Text truncates gracefully (assert presence of truncation classes).

Acceptance criteria:

- Description reliably renders from either prop source with fallback.
- `aria-valuetext`, `aria-label/labelledby`, and `aria-describedby` wired correctly.
- Tests pass and type checks succeed.

Security considerations:

- Treat description as plain text only; no dangerous HTML APIs.

Out of scope for this task:

- Debounced live announcements.
- Any styling beyond standard Tailwind utilities aligned with the design system.
