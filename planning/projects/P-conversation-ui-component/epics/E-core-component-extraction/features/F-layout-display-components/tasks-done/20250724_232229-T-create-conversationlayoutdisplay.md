---
kind: task
id: T-create-conversationlayoutdisplay
parent: F-layout-display-components
status: done
title: Create ConversationLayoutDisplay root layout component
priority: normal
prerequisites:
  - T-create-layout-component-props
  - T-create-conversationscreendisplay
  - T-create-maincontentpaneldisplay
created: "2025-07-24T22:07:51.246507"
updated: "2025-07-24T23:16:43.376651"
schema_version: "1.1"
worktree: null
---

# Create ConversationLayoutDisplay Root Layout Component

## Purpose

Create the ConversationLayoutDisplay component that provides the highest-level layout composition, managing the complete conversation interface layout including sidebar and main content area positioning with responsive behavior.

## Context

From DesignPrototype analysis, this component corresponds to the main layout structure (lines 241-245, 734-914) that provides:

- Main layout flex container (`display: "flex"`)
- Sidebar and content area composition
- Responsive sidebar visibility management
- Overall interface layout coordination

## Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` lines 241-245 (styles.mainLayout)
- **Usage Context**: Lines 734-914 showing sidebar and content area composition
- **Integration**: Composes sidebar and main content components

## Technical Approach

### 1. Component Structure

```typescript
// apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx
import React from "react";
import { ConversationLayoutDisplayProps } from "@fishbowl-ai/shared";

export const ConversationLayoutDisplay: React.FC<
  ConversationLayoutDisplayProps
> = ({
  sidebarComponent,
  mainContentComponent,
  sidebarVisible,
  responsive = true,
  className,
}) => {
  // Implementation here
};
```

### 2. Extract Styling from DesignPrototype

- Copy `styles.mainLayout` from DesignPrototype (lines 241-245)
- Convert to component-scoped CSS-in-JS
- Maintain horizontal flex layout for sidebar and content
- Add responsive behavior for future mobile support

### 3. Layout Composition

- Composes provided sidebar and main content components
- Manages sidebar visibility and transitions
- Provides responsive breakpoint handling
- Maintains proper layout proportions

## Implementation Steps

1. **Create component file** at `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`
2. **Import required dependencies**:
   - React and React.FC
   - ConversationLayoutDisplayProps from shared package
3. **Extract mainLayout styles** from DesignPrototype lines 241-245
4. **Implement component logic**:
   - Apply horizontal flex container
   - Handle sidebar visibility management
   - Compose sidebar and main content components
   - Support responsive behavior if enabled
   - Support optional className prop
5. **Add responsive considerations** for future mobile support
6. **Test with existing sidebar and main content components**
7. **Update LayoutShowcase immediately**:
   - Import ConversationLayoutDisplay into LayoutShowcase
   - Replace placeholder main layout with ConversationLayoutDisplay
   - Pass existing sidebar and MainContentPanelDisplay as props
   - Test sidebar visibility toggling and layout composition within ConversationScreenDisplay

## Styling Requirements

### Extract from DesignPrototype

```javascript
// From DesignPrototype.tsx lines 241-245
mainLayout: {
  flex: 1,
  display: "flex",
  overflow: "hidden",
}
```

### Component Integration

- Convert to CSS-in-JS within component
- Maintain flex: 1 for full available height
- Preserve horizontal flex layout for sidebar/content composition
- Keep overflow: hidden for contained layout
- Add responsive behavior for mobile breakpoints

## Acceptance Criteria

✅ **Layout Composition**

- Proper horizontal flex layout for sidebar and content
- Correct sidebar visibility management
- Clean composition of provided components
- Responsive behavior foundation for future mobile support

✅ **Component Architecture**

- Uses ConversationLayoutDisplayProps from shared package
- Flexible component composition through props
- Pure layout component with minimal logic
- Proper TypeScript integration

✅ **Visual Fidelity**

- Exact match with DesignPrototype mainLayout structure
- Proper sidebar and content area proportions
- Maintains existing layout behavior
- No visual regressions from extraction

✅ **Responsive Foundation**

- Optional responsive prop for future enhancements
- Proper flex layout that adapts to container changes
- Foundation for mobile breakpoint handling
- Flexible layout system for different screen sizes

## Integration Verification

### Test with Existing Components

- Replace DesignPrototype mainLayout with ConversationLayoutDisplay
- Verify sidebar and content area composition works correctly
- Confirm sidebar visibility toggling functions properly
- Test layout proportions and spacing

### LayoutShowcase Integration

- Update LayoutShowcase immediately upon component creation
- Replace placeholder main layout with ConversationLayoutDisplay
- Compose with existing sidebar components and MainContentPanelDisplay
- Demonstrate sidebar visibility toggling functionality
- Show proper horizontal layout composition within ConversationScreenDisplay
- Validate responsive behavior foundation and layout proportions

## Dependencies

- `T-create-layout-component-props`: Requires ConversationLayoutDisplayProps interface
- `T-create-conversationscreendisplay`: May be composed within this component
- `T-create-maincontentpaneldisplay`: Will be composed as mainContentComponent
- Existing sidebar components from `apps/desktop/src/components/sidebar/`

## Notes

- This is the highest-level layout composition component
- Provides foundation for responsive design implementation
- Should compose cleanly with existing sidebar and content components
- Focuses on overall layout structure and component composition
- Important for maintainable layout architecture

### Log

**2025-07-25T04:22:29.496386Z** - Implemented ConversationLayoutDisplay root layout component with extracted DesignPrototype styles. Created pure layout component that composes sidebar and main content components using horizontal flex layout. Integrated component into LayoutShowcase, replacing mainLayout div with ConversationLayoutDisplay that accepts sidebar and mainContent as props. Component uses ConversationLayoutDisplayProps interface from shared package and maintains exact visual fidelity to original DesignPrototype design. All quality checks pass with proper TypeScript typing, linting, and formatting.

- filesChanged: ["apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx", "apps/desktop/src/components/layout/index.ts", "apps/desktop/src/pages/showcase/LayoutShowcase.tsx"]
