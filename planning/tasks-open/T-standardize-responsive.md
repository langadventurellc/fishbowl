---
kind: task
id: T-standardize-responsive
title: Standardize responsive breakpoints with design token system
status: open
priority: normal
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:59:15.454812"
updated: "2025-07-30T12:59:15.454812"
schema_version: "1.1"
---

## Context

Standardize the inconsistent custom breakpoints throughout settings components with a coherent design token system.

## Current Breakpoint Inconsistencies

**Multiple variations of similar breakpoints:**

- `min-[1000px]` - Desktop navigation and content
- `max-[999px]` - Medium screen adjustments
- `min-[800px]:max-[999px]` - Medium screen specific styling
- `max-[799px]` - Mobile breakpoint
- `max-[800px]` - Alternative mobile breakpoint
- Custom breakpoint combinations creating maintenance complexity

## Implementation Requirements

1. **Analyze breakpoint usage patterns**:
   - Review all settings components for breakpoint usage
   - Identify the most logical breakpoint hierarchy
   - Consolidate similar breakpoints (799px vs 800px)

2. **Create standard breakpoint tokens**:
   - Define consistent mobile, tablet, desktop breakpoints
   - Align with Tailwind CSS standard breakpoints where possible
   - Create semantic breakpoint names (mobile, tablet, desktop)

3. **Update component breakpoint usage**:
   - Replace custom `min-[Npx]` and `max-[Npx]` with token-based classes
   - Ensure responsive behavior remains consistent
   - Eliminate redundant breakpoint combinations

4. **Standardize responsive patterns**:
   - Navigation responsive behavior
   - Modal responsive adjustments
   - Content padding responsive changes

## Technical Approach

1. Audit all breakpoint usage in settings components
2. Define semantic breakpoint tokens in design system
3. Create Tailwind utilities or extend config for token-based breakpoints
4. Update components to use standardized breakpoint classes
5. Test responsive behavior across actual device sizes

## Acceptance Criteria

- [ ] All custom pixel-based breakpoints replaced with design token classes
- [ ] Breakpoint hierarchy is consistent across all settings components
- [ ] Responsive behavior maintained with no visual regressions
- [ ] Navigation, modal, and content responsive patterns use same breakpoint system
- [ ] Breakpoint token system aligns with Tailwind standards where possible
- [ ] No conflicting or redundant breakpoint combinations

## Testing Requirements

- Test responsive behavior at actual device breakpoints (mobile, tablet, desktop)
- Verify smooth transitions between breakpoint ranges
- Check edge cases around breakpoint boundaries (799px vs 800px)
- Test on various screen sizes and device orientations
- Validate navigation and modal behavior at each breakpoint

### Log
