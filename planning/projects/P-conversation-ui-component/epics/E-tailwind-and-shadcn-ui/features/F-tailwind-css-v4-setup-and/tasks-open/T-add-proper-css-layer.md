---
kind: task
id: T-add-proper-css-layer
title: Add proper CSS layer organization with @layer directives
status: open
priority: normal
prerequisites:
  - T-verify-tailwind-css-integration
created: "2025-07-25T17:01:37.586463"
updated: "2025-07-25T17:01:37.586463"
schema_version: "1.1"
parent: F-tailwind-css-v4-setup-and
---

# Add Proper CSS Layer Organization with @layer Directives

## Context

Implement proper CSS cascade layer organization using Tailwind CSS v4's @layer directives to ensure predictable styling precedence and optimal CSS architecture. This establishes the foundation for maintainable CSS ordering.

## Implementation Requirements

### CSS Layer Structure

Update `packages/ui-theme/src/claymorphism-theme.css` to use proper layer organization:

```css
@import "tailwindcss";

@layer theme, base, components, utilities;

@layer theme {
  :root {
    /* existing CSS variables */
  }

  .dark {
    /* existing CSS variables */
  }
}

@theme inline {
  /* existing theme mappings */
}
```

### Layer Implementation Details

- **@layer theme**: Contains CSS custom properties and theme definitions
- **@layer base**: Tailwind's base styles (handled by import)
- **@layer components**: Component-specific styles (future use)
- **@layer utilities**: Tailwind utilities (handled by import)
- **@theme inline**: Remains outside layers for proper Tailwind integration

## Detailed Acceptance Criteria

### Layer Declaration

✅ **Layer Order Defined**: `@layer theme, base, components, utilities;` declared correctly  
✅ **Theme Layer Wrapping**: All CSS variables wrapped in `@layer theme { }`  
✅ **Theme Inline Preserved**: `@theme inline` block remains outside layer structure  
✅ **Cascade Order**: Layers provide predictable style precedence (theme < base < components < utilities)

### CSS Architecture

✅ **Proper Precedence**: Utilities override components, components override base, base overrides theme  
✅ **Variable Access**: CSS variables remain accessible from all layers  
✅ **Dark Mode Functionality**: `.dark` selector continues to work within theme layer  
✅ **Theme Integration**: `@theme inline` properly maps variables for Tailwind use

### Build Integration

✅ **Vite Processing**: Layers processed correctly by Tailwind Vite plugin  
✅ **CSS Output**: Generated CSS maintains proper layer organization  
✅ **No Regressions**: All existing functionality preserved with layer structure  
✅ **Layer Optimization**: Build process optimizes layered CSS efficiently

## Testing Requirements

### Layer Testing

- **Cascade verification**: Test that utilities override component styles appropriately
- **Variable access**: Confirm CSS variables accessible across all layers
- **Dark mode**: Verify theme layer variables update correctly for dark mode
- **Build output**: Examine generated CSS to confirm layer structure

### Integration Tests

- **Visual consistency**: All components render identically with layer structure
- **Style precedence**: Test specific cases of utility overriding component styles
- **Performance impact**: Verify layer organization doesn't affect performance

## Security Considerations

### CSS Security

- **Layer isolation**: Ensure layers don't expose unintended style conflicts
- **Build integrity**: Layer processing maintains build security
- **Content validation**: Only intended styles included in each layer

## Performance Requirements

### CSS Performance

- **Layer efficiency**: Layer organization improves CSS specificity resolution
- **Build optimization**: Layers enable better CSS optimization and tree-shaking
- **Runtime performance**: No performance degradation from layer structure

## Dependencies

- **Prerequisites**: T-verify-tailwind-css-integration (integration validation)
- **Enables**: Future component-specific CSS organization and utility overrides

## Technical Benefits

### Architecture Improvements

- **Predictable cascade**: Eliminates CSS specificity conflicts
- **Maintainable structure**: Clear separation of concerns between theme, base, components, utilities
- **Future-ready**: Prepares CSS architecture for component-specific styling
- **Tailwind optimization**: Enables better CSS optimization by Tailwind processor

### Development Experience

- **Clear organization**: Developers understand exactly where styles belong
- **Conflict resolution**: Layer precedence makes debugging style issues easier
- **Scalable structure**: Architecture supports growing component library

## Implementation Guidance

- Move all existing `:root` and `.dark` content into `@layer theme { }`
- Keep `@theme inline` outside layer structure (required for Tailwind integration)
- Maintain exact content of CSS variables - only add layer wrapping
- Test thoroughly to ensure no visual changes after layer implementation

## Technical Notes

- Layers provide CSS cascade control without specificity issues
- Theme layer establishes design token foundation
- Structure enables future migration of component styles to components layer
- Tailwind utilities automatically use utilities layer for proper precedence

### Log
