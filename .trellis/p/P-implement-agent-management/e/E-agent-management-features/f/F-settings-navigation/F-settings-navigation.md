---
id: F-settings-navigation
title: Settings Navigation Integration
status: done
priority: medium
parent: E-agent-management-features
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/SettingsNavigation.tsx: Removed templates subtab from agents navigation configuration
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T21:13:13.071Z
updated: 2025-08-19T21:13:13.071Z
---

## Purpose

Integrate the Agents section into the settings navigation menu, establishing the foundation for agent management features.

## Key Components to Implement

- Add "Agents" navigation item to settings sidebar
- Implement routing to Agents section
- Set up proper navigation state management
- Ensure cleanup when leaving section

## Detailed Acceptance Criteria

- **Navigation Item**: "Agents" item appears in settings navigation menu in correct position
- **Routing**: Clicking "Agents" navigates to the Agents section correctly
- **Active State**: Navigation item shows active state when on Agents section
- **Keyboard Navigation**: Arrow keys work for navigating to/from Agents item
- **State Cleanup**: Proper cleanup of agent-related state when leaving section
- **Focus Management**: Proper focus handling when navigating to/from section

## Technical Requirements

- Follow existing settings navigation patterns
- Use React Router for navigation handling
- Implement keyboard event handlers for accessibility
- Ensure navigation item follows existing styling

## Implementation Guidance

1. Modify settings navigation component to include Agents item
2. Add route configuration for `/settings/agents` path
3. Implement navigation state tracking
4. Add keyboard navigation support
5. Set up cleanup hooks for state management

## Testing Requirements

- Verify navigation item appears in correct order
- Test clicking navigates to Agents section
- Verify active state styling
- Test keyboard navigation (up/down arrows)
- Verify state cleanup on navigation away

## Dependencies

- Must integrate with existing settings modal structure
- Follow established navigation patterns from roles/personalities sections
