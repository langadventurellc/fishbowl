---
kind: task
id: T-add-message-context-toggle
status: done
title: Add message context toggle functionality to MessageItem component
priority: normal
prerequisites: []
created: "2025-07-24T15:47:02.318307"
updated: "2025-07-24T15:49:00.707484"
schema_version: "1.1"
worktree: null
---

## Overview

Add interactive message context toggle functionality to the MessageItem component, enabling users to include/exclude messages from conversation context through a visual toggle button.

## Context

The MessageItem component (`apps/desktop/src/components/chat/MessageItem.tsx`) is currently a pure display component that receives interactive props but doesn't use them. The DesignPrototype (`apps/desktop/src/pages/DesignPrototype.tsx`) contains a working implementation of the context toggle functionality that needs to be integrated into the actual MessageItem component. Do not write automated tests for this task, as it is not required.

## Current State

- MessageItem component displays messages but has no interactive functionality
- Component receives `onToggleContext` prop but doesn't use it
- The `message.isActive` property already controls visual opacity (lines 122-126)
- DesignPrototype shows the desired toggle button implementation (lines 968-983)

## Implementation Requirements

### 1. Add Context Toggle Button

Add the interactive toggle button from DesignPrototype to MessageItem component:

```tsx
<button
  style={{
    ...styles.contextToggle,
    ...(message.isActive
      ? styles.contextToggleActive
      : styles.contextToggleInactive),
  }}
  onClick={() => onToggleContext(message.id)}
  title={
    message.isActive
      ? "Click to exclude from context"
      : "Click to include in context"
  }
>
  {message.isActive ? "✓" : ""}
</button>
```

### 2. Add Required Styles

Copy the toggle button styles from DesignPrototype (lines 457-480):

```tsx
contextToggle: {
  position: "absolute" as const,
  right: "8px",
  top: "8px",
  width: "20px",
  height: "20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s",
  zIndex: 100,
},
contextToggleActive: {
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
},
contextToggleInactive: {
  backgroundColor: "var(--muted)",
  color: "var(--muted-foreground)",
},
```

### 3. Update Message Wrapper Structure

Ensure the message wrapper has relative positioning for the absolute-positioned toggle button. Update the messageWrapper style if needed to match DesignPrototype structure.

### 4. Handle Event Propagation

Use the `onToggleContext` prop that's already passed to the component. The component should call `onToggleContext(message.id)` when the toggle button is clicked.

### 5. Accessibility Improvements

- Add proper ARIA labels for the toggle button
- Ensure keyboard navigation works correctly
- Provide clear visual feedback for active/inactive states

## Technical Approach

1. **Extract styles** from DesignPrototype lines 457-480 and add to MessageItem styles object
2. **Add toggle button** to the message wrapper for non-system messages (similar to DesignPrototype structure)
3. **Connect event handler** using the existing `onToggleContext` prop
4. **Verify positioning** works correctly for all message types (user, agent)

## Acceptance Criteria

✅ **Visual Toggle Button**

- Toggle button appears in top-right corner of message wrapper
- Button shows checkmark (✓) when message is active
- Button is empty when message is inactive
- Button styling matches DesignPrototype appearance

✅ **Interactive Functionality**

- Clicking toggle button calls `onToggleContext(message.id)`
- Button shows appropriate hover states
- Button has proper cursor pointer styling

✅ **Visual Feedback**

- Active messages show primary color button background
- Inactive messages show muted color button background
- Message opacity still controlled by `message.isActive` (existing behavior)

✅ **Accessibility**

- Button has descriptive title attribute
- Button is keyboard accessible
- Button has proper ARIA properties

✅ **Message Type Support**

- Toggle button appears on user messages
- Toggle button appears on agent messages
- System messages remain unchanged (no toggle button)

✅ **Code Quality**

- Styles follow existing component patterns
- Event handling uses existing prop structure
- Component maintains existing JSDoc documentation standards

## Files to Modify

- `apps/desktop/src/components/chat/MessageItem.tsx` - Add toggle button functionality

## Dependencies

- No external dependencies required
- Uses existing CSS custom properties and styling patterns
- Integrates with existing prop interface from `@fishbowl-ai/shared`

### Log

**2025-07-24T20:53:04.002595Z** - Successfully implemented interactive context toggle functionality in MessageItem component. Added toggle button to user and agent messages with proper styling, event handling, and accessibility features. Toggle button shows checkmark (✓) when message is active and empty when inactive, using primary/muted color scheme. Connected to existing onToggleContext prop with proper event handling. System messages remain unchanged. All quality checks passing with 0 linting errors.

- filesChanged: ["apps/desktop/src/components/chat/MessageItem.tsx"]
