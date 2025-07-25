---
kind: task
id: T-create-conversationscreendisplay
title: Create ConversationScreenDisplay layout component
status: open
priority: high
prerequisites:
  - T-create-layout-component-props
created: "2025-07-24T22:06:26.639364"
updated: "2025-07-24T22:06:26.639364"
schema_version: "1.1"
parent: F-layout-display-components
---

# Create ConversationScreenDisplay Layout Component

## Purpose

Extract and create the ConversationScreenDisplay component that provides the root layout structure for the entire conversation interface, managing the overall screen container with theme support and full-screen layout.

## Context

From DesignPrototype analysis, this component corresponds to the main container structure (lines 231-240) that provides:

- Full-screen viewport layout (`width: "100%", height: "100vh"`)
- Theme-based background and color management
- Root flex container for the application layout
- Theme transition animations

## Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` lines 231-240 (styles.container)
- **Theme System**: Uses CSS custom properties from `packages/ui-theme/src/claymorphism-theme.css`

## Technical Approach

### 1. Component Structure

```typescript
// apps/desktop/src/components/layout/ConversationScreenDisplay.tsx
import React from "react";
import { ConversationScreenDisplayProps } from "@fishbowl-ai/shared";

export const ConversationScreenDisplay: React.FC<
  ConversationScreenDisplayProps
> = ({ sidebarVisible, children, themeMode, className }) => {
  // Implementation here
};
```

### 2. Extract Styling from DesignPrototype

- Copy `styles.container` from DesignPrototype (lines 231-240)
- Convert to component-scoped CSS-in-JS
- Preserve theme variable usage: `var(--background)`, `var(--foreground)`, etc.
- Maintain transition animations: `transition: "background-color 0.2s, color 0.2s"`

### 3. Props Integration

- `sidebarVisible`: Controls layout adjustments if needed
- `children`: Renders the main application content
- `themeMode`: Integrates with existing theme system
- `className`: Allows external styling customization

## Implementation Steps

1. **Create component file** at `apps/desktop/src/components/layout/ConversationScreenDisplay.tsx`
2. **Import required dependencies**:
   - React and React.FC
   - ConversationScreenDisplayProps from shared package
   - Any theme utilities if needed
3. **Extract container styles** from DesignPrototype lines 231-240
4. **Implement component logic**:
   - Apply theme class (`isDark ? "dark" : ""`)
   - Handle theme-based styling
   - Render children within layout container
5. **Add responsive considerations** for future mobile support
6. **Test with existing DesignPrototype content** to ensure visual fidelity
7. **Update LayoutShowcase immediately**:
   - Import ConversationScreenDisplay into LayoutShowcase
   - Replace placeholder screen container with ConversationScreenDisplay
   - Test that component renders (expect minimal visual content initially)
   - Verify theme switching works in LayoutShowcase context

## Styling Requirements

### Extract from DesignPrototype

```javascript
// From DesignPrototype.tsx lines 231-240
container: {
  width: "100%",
  height: "100vh",
  backgroundColor: isDark ? "var(--background)" : "var(--background)",
  color: isDark ? "var(--foreground)" : "var(--foreground)",
  fontFamily: "var(--font-sans)",
  display: "flex",
  flexDirection: "column" as const,
  transition: "background-color 0.2s, color 0.2s",
}
```

### Component Integration

- Convert to CSS-in-JS within component
- Use themeMode prop instead of isDark state
- Maintain all CSS custom property references
- Preserve transition animations for smooth theme switching

## Acceptance Criteria

✅ **Visual Fidelity**

- Exact match with DesignPrototype container layout
- Full-screen viewport (`100vw` x `100vh`)
- Proper theme variable integration
- Smooth theme transition animations

✅ **Component Architecture**

- Uses ConversationScreenDisplayProps from shared package
- Pure layout component with no business logic
- Proper TypeScript integration
- Clean CSS-in-JS implementation

✅ **Theme Integration**

- Responds to themeMode prop changes
- Uses existing CSS custom properties
- Maintains dark/light theme switching behavior
- Preserves font family and layout properties

✅ **Code Quality**

- No interactive functionality added
- Follows existing component patterns
- TypeScript strict mode compliance
- Clean, readable component structure

## Integration Verification

### Test with DesignPrototype Content

- Replace DesignPrototype container with ConversationScreenDisplay
- Verify identical visual output
- Test theme switching functionality
- Confirm no layout or styling regressions

### LayoutShowcase Integration

- Update LayoutShowcase immediately upon component creation
- Replace placeholder screen container with ConversationScreenDisplay
- Initially expect minimal visual content (just background/theme)
- Verify theme switching capabilities work in showcase context
- Validate that component serves as foundation for other layout components

## Dependencies

- `T-create-layout-component-props`: Requires ConversationScreenDisplayProps interface
- Existing theme system in `packages/ui-theme/src/claymorphism-theme.css`
- React and TypeScript dependencies

## Notes

- This is the root layout component - all other layout components will be composed within it
- Must maintain exact visual fidelity with current DesignPrototype
- Should be flexible enough for future responsive enhancements
- Focus on clean extraction without adding new functionality

### Log
