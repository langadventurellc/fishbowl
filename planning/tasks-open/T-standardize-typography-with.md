---
kind: task
id: T-standardize-typography-with
title: Standardize typography with design token system
status: open
priority: normal
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:58:22.374400"
updated: "2025-07-30T12:58:22.374400"
schema_version: "1.1"
---

## Context

Replace hardcoded font sizes throughout settings components with standardized typography design tokens to ensure consistent text hierarchy.

## Target Values

From analysis of `SettingsContent.tsx` and related components:

- `text-[24px] font-bold` → Main heading token
- `text-[18px] font-semibold` → Section heading token
- `text-[13px] text-muted-foreground` → Description/help text token
- Mixed usage of standard Tailwind (`text-sm`) vs custom sizes

## Implementation Requirements

1. **Create typography token hierarchy**:
   - Settings main headings (currently 24px)
   - Settings section headings (currently 18px)
   - Settings description text (currently 13px)
   - Form labels and input text
   - Button text sizing

2. **Standardize font size usage**:
   - Replace custom `text-[Npx]` classes with token-based classes
   - Maintain existing font weights and colors
   - Ensure consistent line heights for readability
   - Address mixing of Tailwind standard and custom sizes

3. **Update affected components**:
   - Settings content headings (General, Appearance, Advanced)
   - Section subheadings throughout settings
   - Help text and descriptions
   - Form component labels

## Technical Approach

1. Define typography scale in design token foundation
2. Create utility classes or Tailwind extension for typography tokens
3. Replace hardcoded `text-[Npx]` with token-based classes
4. Maintain existing text color and weight combinations
5. Test typography hierarchy for visual consistency

## Acceptance Criteria

- [ ] All hardcoded font sizes replaced with design token classes
- [ ] Typography hierarchy is visually consistent across settings
- [ ] No mixing of standard Tailwind and custom font sizes
- [ ] Line heights optimized for readability with token system
- [ ] Font weight and color combinations preserved
- [ ] Settings text maintains clear visual hierarchy (headings → sections → descriptions)

## Testing Requirements

- Verify typography renders consistently across all settings sections
- Test readability at different screen sizes and zoom levels
- Check that text hierarchy guides user attention appropriately
- Validate no visual regressions in text spacing or alignment

### Log
