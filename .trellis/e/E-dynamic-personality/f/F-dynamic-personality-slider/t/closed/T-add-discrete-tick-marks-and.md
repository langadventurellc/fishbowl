---
id: T-add-discrete-tick-marks-and
title: Add discrete tick marks and current-value highlight to PersonalitySlider
  (with tests)
status: done
priority: medium
parent: F-dynamic-personality-slider
prerequisites:
  - T-implement-base-personalityslid
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx:
    Added discrete tick marks with absolute positioning, active tick
    highlighting, and disabled state styling
log:
  - Enhanced PersonalitySlider with discrete tick marks and active value
    highlighting. Implemented 6 tick marks positioned at 0%, 20%, 40%, 60%, 80%,
    100% along the slider track using absolute positioning within a relative
    container. Active tick is highlighted with primary color and shadow, while
    inactive ticks use border color. Disabled state applies 50% opacity to all
    ticks while maintaining color distinction. All tick marks use
    percentage-based positioning for responsive alignment and
    pointer-events-none to avoid interfering with slider interaction. Quality
    checks pass with proper linting, formatting, and type checking.
schema: v1.0
childrenIds: []
created: 2025-08-27T18:52:02.091Z
updated: 2025-08-27T18:52:02.091Z
---

Overview:
Enhance the PersonalitySlider with visual tick marks at each discrete position (0, 20, 40, 60, 80, 100) and a clear highlight for the current value. Keep visuals consistent with the design system and ensure alignment across widths. Include unit tests for DOM structure and active-state rendering.

Context:

- Component path: `apps/desktop/src/components/settings/personalities/PersonalitySlider.tsx`
- Uses existing Radix-based `Slider` styles at `apps/desktop/src/components/ui/slider.tsx` and Tailwind.
- Exported via `apps/desktop/src/components/settings/personalities/index.ts` (no change needed if already exported).

Specific implementation requirements:

- Render 6 tick marks, positioned at 0%, 20%, 40%, 60%, 80%, 100% along the track.
- Approach options (choose simplest):
  - A) Absolutely-positioned tick elements within a relatively positioned track container; or
  - B) CSS background with linear-gradient for ticks plus a positioned overlay for the active tick.
- Highlight the tick that corresponds to the current discrete value using a distinct color and sufficient contrast (WCAG AA).
- Ensure tick mark alignment remains correct across container widths; do not rely on fixed pixel values.
- Keep implementation inside the component (no global CSS files); prefer Tailwind utility classes.
- Respect `disabled` state in tick visuals with reduced contrast/opacity.

Technical approach:

1. Wrap the existing `SliderPrimitive.Track` in a relatively positioned container that can host tick elements.
2. Compute an array of positions [0,20,40,60,80,100] and render small tick divs positioned via `left: {pos}%` for horizontal orientation.
3. Apply Tailwind classes for tick base styling and a conditional class for the active tick (based on `value`).
4. Verify visually in DOM that ticks are inside the track and do not intercept pointer events.

Testing requirements:

- Unit tests in `apps/desktop/src/components/settings/personalities/__tests__/PersonalitySlider.test.tsx`:
  - Renders exactly 6 ticks.
  - Active tick corresponds to prop `value` for all discrete values.
  - Ticks maintain expected `left` style percentages; assert on style attribute or data attributes.
  - Disabled renders tick marks with disabled styles (class assertion).

Acceptance criteria:

- 6 visible tick marks aligned to the discrete positions.
- Active tick visually distinguished with design-system-consistent color and meets contrast.
- All tests pass with `pnpm test`; type checks pass with `pnpm type-check`.

Security considerations:

- Visual-only additions; no external input parsed.

Out of scope for this task:

- Description text and aria-valuetext updates.
- Live announcements / debouncing behavior.
- Any replacement of existing sliders in other forms.
