---
kind: task
id: T-integrate-shadcn-ui-css
title: Integrate shadcn/ui CSS variables with existing theme system
status: open
priority: high
prerequisites:
  - T-install-shadcn-ui-core
created: "2025-07-25T18:21:17.408920"
updated: "2025-07-25T18:21:17.408920"
schema_version: "1.1"
parent: F-shadcn-ui-component-integration
---

# Integrate shadcn/ui CSS Variables with Existing Theme System

## Context

Ensure shadcn/ui components use the existing CSS variable theme system seamlessly. The current components use variables like `--primary`, `--secondary`, etc., and shadcn/ui needs to be configured to use these same variables.

## Implementation Requirements

- Map shadcn/ui CSS variables to existing theme variables
- Ensure both light and dark themes work with shadcn/ui components
- Maintain visual consistency between custom and shadcn/ui components
- Test theme switching functionality

## Detailed Steps

1. Examine existing CSS variable definitions in the current CSS files
2. Update the main CSS file to include shadcn/ui variable mappings:

   ```css
   :root {
     /* Existing variables remain unchanged */
     --primary: /* existing value */;
     --secondary: /* existing value */;

     /* Map shadcn/ui variables to existing ones */
     --background: var(--background-color);
     --foreground: var(--text-color);
     /* ... other mappings */
   }
   ```

3. Test theme switching (light/dark mode)
4. Verify visual consistency across component types
5. Document the variable mapping strategy

## Acceptance Criteria

✅ shadcn/ui components respect existing light/dark theme switching  
✅ Visual consistency maintained between custom and shadcn/ui components  
✅ No color conflicts or theme inconsistencies  
✅ Theme toggle functionality works with shadcn/ui components  
✅ CSS variable mapping documented for future reference  
✅ Build process includes updated CSS without errors

## Technical Notes

- Reference existing theme implementation in ShowcaseLayout and ThemeToggle components
- Ensure compatibility with Tailwind CSS v4 CSS variable approach
- Consider HSL vs RGB color formats for consistency

## Testing Requirements

- Test all theme states (light/dark) with shadcn/ui components
- Visual regression testing for color consistency
- Verify theme switching performance is not degraded

## See Also

- Existing theme implementation in `apps/desktop/src/components/showcase/ThemeToggle.tsx`
- CSS variable definitions in main stylesheet

### Log
