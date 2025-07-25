---
kind: task
id: T-create-maincontentpaneldisplay
title: Create MainContentPanelDisplay layout component
status: open
priority: high
prerequisites:
  - T-create-layout-component-props
created: "2025-07-24T22:06:47.264875"
updated: "2025-07-24T22:06:47.264875"
schema_version: "1.1"
parent: F-layout-display-components
---

# Create MainContentPanelDisplay Layout Component

## Purpose

Extract and create the MainContentPanelDisplay component that provides the primary content area layout, managing the vertical flex structure for the main conversation interface including agent labels, chat area, and input area.

## Context

From DesignPrototype analysis, this component corresponds to the content area structure (lines 307-312) that provides:

- Main content flex container (`flex: 1`)
- Vertical column layout (`flexDirection: "column"`)
- Overflow management (`overflow: "hidden"`)
- Houses agent labels bar, chat messages, and input area

## Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` lines 307-312 (styles.contentArea)
- **Usage Context**: Contains AgentLabelsBar, ChatArea, and InputArea within the main layout

## Technical Approach

### 1. Component Structure

```typescript
// apps/desktop/src/components/layout/MainContentPanelDisplay.tsx
import React from "react";
import { MainContentPanelDisplayProps } from "@fishbowl-ai/shared";

export const MainContentPanelDisplay: React.FC<
  MainContentPanelDisplayProps
> = ({ children, className }) => {
  // Implementation here
};
```

### 2. Extract Styling from DesignPrototype

- Copy `styles.contentArea` from DesignPrototype (lines 307-312)
- Convert to component-scoped CSS-in-JS
- Maintain flex layout properties for proper component composition
- Preserve overflow behavior for contained scrolling

### 3. Layout Composition

- Acts as container for AgentLabelsContainerDisplay
- Houses ChatContainerDisplay for message scrolling
- Contains input area components
- Maintains proper spacing and overflow management

## Implementation Steps

1. **Create component file** at `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
2. **Import required dependencies**:
   - React and React.FC
   - MainContentPanelDisplayProps from shared package
3. **Extract contentArea styles** from DesignPrototype lines 307-312
4. **Implement component logic**:
   - Apply flex column layout
   - Handle overflow management
   - Render children within container
   - Support optional className prop
5. **Ensure proper child component integration**
6. **Test with existing components** (AgentLabels, Chat, Input areas)
7. **Update LayoutShowcase immediately**:
   - Import MainContentPanelDisplay into LayoutShowcase
   - Replace placeholder main content area with MainContentPanelDisplay
   - Add placeholder content to test vertical layout structure
   - Verify proper flex behavior within parent container

## Styling Requirements

### Extract from DesignPrototype

```javascript
// From DesignPrototype.tsx lines 307-312
contentArea: {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  overflow: "hidden",
}
```

### Component Integration

- Convert to CSS-in-JS within component
- Maintain flex: 1 for proper sidebar layout
- Preserve column direction for vertical stacking
- Keep overflow: hidden for contained scrolling
- Support additional className for customization

## Acceptance Criteria

✅ **Layout Structure**

- Proper flex: 1 sizing within parent container
- Vertical column layout for child components
- Correct overflow management
- Clean container for composed components

✅ **Component Architecture**

- Uses MainContentPanelDisplayProps from shared package
- Pure layout component with no business logic
- Proper TypeScript integration
- Simple, focused responsibility

✅ **Visual Fidelity**

- Exact match with DesignPrototype contentArea layout
- Proper child component composition
- Maintains existing spacing and alignment
- No visual regressions from extraction

✅ **Code Quality**

- No interactive functionality added
- Follows existing component patterns
- TypeScript strict mode compliance
- Clean, readable component structure

## Integration Verification

### Test with Existing Components

- Replace DesignPrototype contentArea with MainContentPanelDisplay
- Verify AgentLabelsBar renders properly within container
- Confirm ChatArea scrolling behavior is preserved
- Test InputArea positioning and layout

### LayoutShowcase Integration

- Update LayoutShowcase immediately upon component creation
- Replace placeholder main content area with MainContentPanelDisplay
- Add placeholder content to demonstrate vertical column layout
- Show proper flex behavior within ConversationScreenDisplay
- Validate overflow management and container behavior

## Dependencies

- `T-create-layout-component-props`: Requires MainContentPanelDisplayProps interface
- Future integration with AgentLabelsContainerDisplay
- Future integration with ChatContainerDisplay
- Future integration with input area components

## Notes

- This component focuses purely on layout structure
- Should compose cleanly with other layout components
- Maintains the exact layout behavior from DesignPrototype
- Simple container with clear, focused responsibility

### Log
