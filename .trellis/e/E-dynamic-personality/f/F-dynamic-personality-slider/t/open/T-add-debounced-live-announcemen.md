---
id: T-add-debounced-live-announcemen
title: Add debounced live announcements and a11y polish to PersonalitySlider
  (with tests)
status: open
priority: medium
parent: F-dynamic-personality-slider
prerequisites:
  - T-add-metadata-description
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T18:52:34.582Z
updated: 2025-08-27T18:52:34.582Z
---

Overview:
Complete accessibility support by adding polite, debounced screen reader announcements when the description/value changes, ensuring proper focus handling and visible focus indicators. Confirm WCAG AA color contrast for the active tick and focus ring using existing theme tokens. Include unit tests that validate ARIA wiring and the announcement call behavior.

Context:

- Component path: `apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx`
- Utilities available:
  - `apps/desktop/src/utils/announceToScreenReader.ts`
  - `apps/desktop/src/hooks/useDebounce.ts`
- The component already provides `aria-valuetext`, `aria-describedby`, keyboard navigation, and discrete behavior from prior tasks.

Specific implementation requirements:

- Live announcements:
  - On discrete value change, announce the resolved short description in a polite live region via `announceToScreenReader(text, 'polite')`.
  - Debounce announcements by ~300ms. Do not debounce `onChange`.
- Focus management and indicators:
  - Ensure the slider thumb has visible focus outline using existing Tailwind classes (`focus-visible:ring-4` already exists in base Slider; verify presence or add equivalent).
  - Confirm tab order is logical and the control is keyboard operable.
- Contrast:
  - Use existing design tokens/classes for active tick and focus ring to meet WCAG AA. Avoid custom colors.

Technical approach:

1. Import `useDebounce` and `announceToScreenReader`. Create a debounced announcer callback that is invoked on discrete value changes.
2. Call the debounced announcer with a readable string, e.g., `${label}: ${resolvedShort}`.
3. Verify focus styling is present; add classNames if needed on the thumb/root without altering base styles materially.

Testing requirements:

- Unit tests in `__tests__/PersonalitySlider.test.tsx`:
  - Mock `announceToScreenReader` and assert it is called once per change (debounced) with the expected text.
  - Keyboard change triggers announcement after debounce interval (use fake timers).
  - Focus indicator classes present on the thumb when focused (DOM/class assertions).

Acceptance criteria:

- Announcements are polite, debounced, and reflect the current description.
- Focus indicators clearly visible; keyboard operation preserved.
- Tests pass and type checks succeed.

Security considerations:

- Announced text derived from plain strings; no HTML injection.

Out of scope for this task:

- Any integration into other forms or replacing existing sliders.
