---
id: T-add-sidebar-collapse-toggle
title: Add sidebar collapse toggle button with panel-left icon
status: done
priority: medium
parent: none
prerequisites: []
affectedFiles:
  apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx:
    Added useState import, PanelLeft icon import, internal collapsed state
    management, and toggle button with absolute positioning. Updated
    SidebarContainerDisplay to use dynamic collapsed state instead of hardcoded
    false.
log:
  - Successfully implemented sidebar collapse toggle button with PanelLeft icon.
    Added internal state management using useState to control sidebar collapsed
    status. Button is positioned in the header area using absolute positioning
    and styled with background color and minimal padding. Toggle functionality
    works smoothly with existing SidebarContainerDisplay collapse animations.
    All quality checks pass and TypeScript compilation successful.
schema: v1.0
childrenIds: []
created: 2025-09-06T20:23:15.781Z
updated: 2025-09-06T20:23:15.781Z
---

## Overview

Add a toggle button to collapse/expand the sidebar in the conversation layout. The button should appear visually positioned in the header title area but be implemented within the ConversationLayoutDisplay component due to overlapping layout constraints.

## Context

- Current sidebar state is hardcoded as `collapsed={false}` in ConversationLayoutDisplay.tsx:20
- The SidebarContainerDisplay already supports a `collapsed` prop and has proper collapse styling
- Button should use the `panel-left` icon from Lucide React (following existing pattern of Lucide imports)
- Visual placement should match the blue box shown in the reference image - appearing in the header/title area

## Implementation Requirements

### 2. Add Sidebar Collapse State Management

- File: `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`
- Import `PanelLeft` icon from "lucide-react"
- Add internal state for sidebar collapsed status using useState
- Pass the collapsed state to SidebarContainerDisplay component

### 3. Create Toggle Button Component

- Position the button at the top-left of the ConversationLayoutDisplay
- Use absolute positioning to appear over the content area (simulating header placement)
- Style the button to match the existing UI design patterns
- Ensure proper spacing from left edge (may need reduced padding on Windows)
- Button should be a clean, minimal design that doesn't interfere with the layout
- Use appropriate hover and active states

### 4. Handle Toggle Functionality

- Implement click handler to toggle the collapsed state
- Ensure smooth transitions using existing CSS transition classes
- Update SidebarContainerDisplay's collapsed prop based on state

## Technical Approach

1. Follow existing component patterns in the codebase (see other Lucide icon usage)
2. Use the established styling approach with Tailwind CSS classes
3. Position button using absolute positioning within the ConversationLayoutDisplay container
4. Include proper TypeScript types for all new props and state

## Acceptance Criteria

- [ ] Button appears in the correct visual position (top-left, header area)
- [ ] Clicking the button toggles the sidebar between collapsed/expanded states
- [ ] Button uses the `panel-left` icon from Lucide React
- [ ] Sidebar collapse animation works smoothly (existing transitions)
- [ ] TypeScript compilation passes without errors
- [ ] Component interface is backward compatible (optional props)
- [ ] Button styling is consistent with existing UI patterns
- [ ] Parent components can control sidebar state via props
- [ ] Unit tests verify toggle functionality and prop handling
- [ ] Button is accessible (proper ARIA attributes, keyboard navigation)

## Files to Modify

2. `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx` - Main implementation

## Dependencies

- Lucide React already available (used throughout the codebase)

## Testing Requirements

No component tests.

## Out of Scope

- State persistence across app restarts
- Global sidebar state management via stores
- Mobile responsive adjustments
- Keyboard shortcuts for toggling
- Animation customization beyond existing transitions
