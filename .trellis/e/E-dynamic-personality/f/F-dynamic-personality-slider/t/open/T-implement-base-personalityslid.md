---
id: T-implement-base-personalityslid
title: Implement base PersonalitySlider with discrete value behavior and unit tests
status: open
priority: high
parent: F-dynamic-personality-slider
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T18:51:41.035Z
updated: 2025-08-27T18:51:41.035Z
---

Overview:
Create the initial PersonalitySlider component as a controlled, Radix-based slider that enforces discrete values only (0, 20, 40, 60, 80, 100). This task focuses on the core controlled behavior, snapping, keyboard handling, prop typing with DiscreteValue, and unit tests. Visual tick marks, metadata description, and live announcements will be added in follow-up tasks.

Context:

- Feature: F-dynamic-personality-slider (Dynamic Personality Slider Component)
- Desktop app only; component lives under: `apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx`
- Export from: `apps/desktop/src/components/settings/personalities/index.ts`
- Build on the existing Radix-based Slider wrapper at `apps/desktop/src/components/ui/slider.tsx`
- Use DiscreteValue type from shared discrete value system (prereq feature): `@fishbowl-ai/shared/utils/discreteValues`
- For screen reader announcements, later tasks will use `apps/desktop/src/utils/announceToScreenReader.ts` (not in scope here)

Specific implementation requirements:

- Controlled component props (initial version):
  - `traitId: string`
  - `label: string`
  - `value: DiscreteValue` (0|20|40|60|80|100)
  - `onChange: (value: DiscreteValue) => void`
  - `disabled?: boolean`
  - `className?: string`
- Enforce discrete behavior:
  - Internal utilities to clamp and round any incoming value to nearest valid discrete step using min=0, max=100, step=20.
  - Ensure drag and click interactions snap to nearest discrete value once past halfway between steps.
  - Ensure `onChange` fires with the normalized discrete value only.
- Keyboard handling:
  - ArrowLeft/Down decreases by 20 (min 0), ArrowRight/Up increases by 20 (max 100).
  - Home jumps to 0; End jumps to 100.
- ARIA (initial minimal set; full a11y in later tasks):
  - Provide `aria-label` derived from `label`.
  - Set `aria-valuemin`, `aria-valuemax`, `aria-valuenow` based on current value.
- Styling:
  - Reuse existing `Slider` visuals; no tick marks yet.
  - Respect `disabled` and pass-through `className`.
- Export the component from `index.ts` in the same folder.

Technical approach:

1. Create `PersonalitySlider.tsx` using the project’s `Slider` wrapper. Maintain internal conversion between single numeric `value` and Radix’s `[number]` tuple.
2. Add discrete math helpers locally in the component file (KISS). Avoid external dependencies.
3. On value change (`onValueChange` from Radix), compute normalized discrete value and emit through `onChange` only when the discrete value changes (avoid redundant re-emits).
4. Implement keyboard handling using Radix props if available; otherwise add a keydown handler on the thumb/root that adjusts the value discretely and calls `onChange`.
5. Update `index.ts` to export the component.
6. Write unit tests under `apps/desktop/src/components/settings/personalities/__tests__/PersonalitySlider.test.tsx` using React Testing Library + Jest.

Testing requirements (in this task):

- Render component at each discrete value and assert displayed ARIA now/min/max.
- Drag/click simulation: verify snapping to nearest discrete and callback fires with 0/20/40/60/80/100 only.
- Keyboard: Arrow keys, Home/End update discretely and clamp within bounds.
- Disabled state prevents changes and `onChange` is not called.
- Class name pass-through applied on root element.

Acceptance criteria:

- Component enforces discrete values only and emits normalized values.
- Keyboard interactions match spec (arrows ±20, home/end to bounds).
- Unit tests cover core behavior and disabled state; all pass locally with `pnpm test`.
- Exports updated in `index.ts` and TypeScript types compile (`pnpm type-check`).

Security considerations:

- Validate inputs to ensure only allowed discrete values are accepted when updating state; coerce others to nearest discrete.
- No IO, no HTML injection, no use of `dangerouslySetInnerHTML`.

Out of scope for this task:

- Visual tick marks and active tick highlighting.
- Metadata description display and aria-valuetext/aria-describedby.
- Debounced screen reader live announcements.
- Replacing existing sliders in other forms.
