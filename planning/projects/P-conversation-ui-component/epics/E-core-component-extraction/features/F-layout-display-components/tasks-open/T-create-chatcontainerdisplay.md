---
kind: task
id: T-create-chatcontainerdisplay
title: Create ChatContainerDisplay layout component
status: open
priority: high
prerequisites:
  - T-create-layout-component-props
created: "2025-07-24T22:07:08.221147"
updated: "2025-07-24T22:07:08.221147"
schema_version: "1.1"
parent: F-layout-display-components
---

# Create ChatContainerDisplay Layout Component

## Purpose

Extract and create the ChatContainerDisplay component that provides the scrollable messages area layout, managing the chat messages container with proper overflow, padding, and spacing for message composition.

## Context

From DesignPrototype analysis, this component corresponds to the chat area structure (lines 354-361) that provides:

- Flexible scrollable container (`flex: 1, overflowY: "auto"`)
- Message area padding (`padding: "16px 24px"`)
- Vertical message layout (`flexDirection: "column"`)
- Message spacing (`gap: "12px"`)

## Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` lines 354-361 (styles.chatArea)
- **Usage Context**: Lines 942-1327 showing message rendering within this container
- **Integration**: Houses existing MessageItem components from chat display components

## Technical Approach

### 1. Component Structure

```typescript
// apps/desktop/src/components/layout/ChatContainerDisplay.tsx
import React from "react";
import { ChatContainerDisplayProps } from "@fishbowl-ai/shared";

export const ChatContainerDisplay: React.FC<ChatContainerDisplayProps> = ({
  children,
  className,
  scrollPosition,
  onScroll,
}) => {
  // Implementation here
};
```

### 2. Extract Styling from DesignPrototype

- Copy `styles.chatArea` from DesignPrototype (lines 354-361)
- Convert to component-scoped CSS-in-JS
- Maintain scrolling behavior and overflow management
- Preserve message spacing and padding

### 3. Scroll Management (Optional)

- Support scrollPosition prop for programmatic scroll control
- Support onScroll callback for scroll position tracking
- Maintain natural scrolling behavior for message reading

## Implementation Steps

1. **Create component file** at `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`
2. **Import required dependencies**:
   - React and React.FC
   - ChatContainerDisplayProps from shared package
   - useRef and useEffect if implementing scroll management
3. **Extract chatArea styles** from DesignPrototype lines 354-361
4. **Implement component logic**:
   - Apply scrollable flex container
   - Handle scroll position management if needed
   - Render children (MessageItem components) within container
   - Support optional className prop
5. **Add scroll management features** if specified in props
6. **Test with existing MessageItem components**
7. **Update LayoutShowcase immediately**:
   - Import ChatContainerDisplay into LayoutShowcase
   - Replace placeholder chat area with ChatContainerDisplay
   - Add sample MessageItem components to test scrolling and spacing
   - Verify proper scrolling behavior and message layout within MainContentPanelDisplay

## Styling Requirements

### Extract from DesignPrototype

```javascript
// From DesignPrototype.tsx lines 354-361
chatArea: {
  flex: 1,
  overflowY: "auto" as const,
  padding: "16px 24px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
}
```

### Component Integration

- Convert to CSS-in-JS within component
- Maintain flex: 1 for proper sizing within MainContentPanel
- Preserve overflowY: auto for scrollable message area
- Keep padding: "16px 24px" for proper message spacing
- Maintain gap: "12px" for consistent message separation

## Acceptance Criteria

✅ **Scrolling Behavior**

- Proper flex: 1 sizing for available space
- Smooth vertical scrolling (`overflowY: "auto"`)
- Natural scroll-to-bottom behavior for new messages
- No layout shift during scrolling

✅ **Message Layout**

- Correct padding (`16px 24px`) for message area
- Proper gap (`12px`) between message components
- Vertical column layout for message stacking
- Clean integration with existing MessageItem components

✅ **Component Architecture**

- Uses ChatContainerDisplayProps from shared package
- Optional scroll management through props
- Pure layout component with minimal logic
- Proper TypeScript integration

✅ **Visual Fidelity**

- Exact match with DesignPrototype chatArea layout
- Identical message spacing and padding
- Preserved scrolling behavior and appearance
- No visual regressions from extraction

## Integration Verification

### Test with Existing MessageItem Components

- Replace DesignPrototype chatArea with ChatContainerDisplay
- Verify MessageItem components render with proper spacing
- Confirm scrolling behavior is identical
- Test with various message lengths and types

### LayoutShowcase Integration

- Update LayoutShowcase immediately upon component creation
- Replace placeholder chat area with ChatContainerDisplay
- Add sample MessageItem components to demonstrate scrolling
- Test proper message spacing (12px gap) and padding (16px 24px)
- Verify scrolling behavior works within MainContentPanelDisplay context
- Validate message layout and container behavior

## Dependencies

- `T-create-layout-component-props`: Requires ChatContainerDisplayProps interface
- Existing MessageItem components from `apps/desktop/src/components/chat/`
- Future integration within MainContentPanelDisplay

## Notes

- This component focuses on the scrollable container layout only
- Should integrate seamlessly with existing MessageItem components
- Maintains exact scrolling behavior from DesignPrototype
- Optional scroll management features for future enhancements
- Critical for proper message display and user experience

### Log
