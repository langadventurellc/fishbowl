---
kind: task
id: T-standardize-navigation-component
status: done
title: Standardize navigation component spacing with design tokens
priority: normal
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:58:06.008881"
updated: "2025-07-30T13:40:36.361590"
schema_version: "1.1"
worktree: null
---

## Context

Replace hardcoded spacing and dimension values in navigation components with design tokens to ensure consistency across different screen sizes.

## Target Components

- `SettingsNavigation.tsx` - Navigation container widths and responsive behavior
- `NavigationItem.tsx` - Button dimensions, padding, and active state indicators
- `SubNavigationTab.tsx` - Sub-navigation sizing and spacing

## Implementation Requirements

1. **Navigation container standardization**:
   - `min-[1000px]:w-[200px]` → design token for desktop nav width
   - `min-[800px]:max-[999px]:w-[180px]` → design token for medium nav width
   - `p-[10px]` internal padding → design token

2. **Navigation item consistency**:
   - `h-[40px] px-3 rounded-[4px]` → standardized button tokens
   - `border-l-[3px]` active indicator → design token
   - `pl-[9px]` calculated padding adjustment → clean token solution

3. **Sub-navigation alignment**:
   - `h-[32px] px-3 rounded-[4px]` → consistent with main nav tokens
   - `border-l-[2px]` sub-nav indicator → design token
   - `pl-[10px]` padding adjustments → clean token solution

## Technical Approach

1. Create navigation-specific design tokens for widths and spacing
2. Establish consistent button height hierarchy (main nav vs sub nav)
3. Simplify padding calculations with direct token values
4. Maintain responsive navigation behavior with token-based breakpoints
5. Ensure active state indicators are visually consistent

## Acceptance Criteria

- [ ] Navigation widths use consistent design tokens across breakpoints
- [ ] Button heights follow standardized token hierarchy
- [ ] Active state borders use design token values
- [ ] Padding calculations eliminated in favor of direct token usage
- [ ] Responsive navigation behavior preserved
- [ ] Visual consistency maintained between main and sub navigation
- [ ] Border radius values standardized across navigation components

## Testing Requirements

- Test navigation rendering at desktop (1000px+), medium (800-999px), and mobile breakpoints
- Verify active states display correctly with token-based indicators
- Check padding and spacing consistency across navigation levels
- Validate smooth responsive transitions between breakpoints

### Log

**2025-07-30T18:47:44.497891Z** - Successfully standardized navigation component spacing with design tokens. Replaced all hardcoded dimensional values with centralized design tokens while maintaining exact visual appearance and responsive behavior. Used CSS calc() for dynamic padding calculations that automatically adjust when token values change. All quality checks pass and tests updated accordingly.

- filesChanged: ["apps/desktop/src/components/settings/SettingsNavigation.tsx", "apps/desktop/src/components/settings/NavigationItem.tsx", "apps/desktop/src/components/settings/SubNavigationTab.tsx", "apps/desktop/src/components/settings/__tests__/FocusIndicators.a11y.test.tsx"]
