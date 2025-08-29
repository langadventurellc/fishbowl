---
id: T-update-agentpill-component
title: Update AgentPill component with enabled state styling and click handling
status: done
priority: high
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-update-agentpillviewmodel-to
affectedFiles:
  packages/ui-shared/src/types/chat/AgentPillProps.ts: Added onToggleEnabled
    callback and conversationAgentId props for toggle functionality with
    detailed JSDoc documentation
  apps/desktop/src/components/chat/AgentPill.tsx: Updated component with
    enabled/disabled styling using opacity, click handling for toggle
    functionality, proper accessibility attributes (aria-pressed, aria-label),
    and enhanced keyboard navigation support
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    "Fixed type compatibility by adding enabled: true property to
    AgentPillViewModel transformation for AgentSettingsViewModel objects"
  apps/desktop/src/components/chat/__tests__/AgentPill.test.tsx:
    Created comprehensive unit test suite with 20 tests covering enabled state
    styling, toggle functionality, accessibility, keyboard navigation, and
    legacy onClick behavior
log:
  - Updated AgentPill component with enabled state styling and click handling
    functionality. Added visual distinction for enabled/disabled agents using
    opacity (100% enabled, 50% disabled), implemented toggle click handling with
    new onToggleEnabled prop, enhanced accessibility with proper ARIA
    attributes, and maintained backward compatibility with existing onClick
    functionality. Created comprehensive test suite with 20 tests covering all
    functionality.
schema: v1.0
childrenIds: []
created: 2025-08-29T03:59:25.836Z
updated: 2025-08-29T03:59:25.836Z
---

# Update AgentPill component with enabled state styling and click handling

## Context

Update the AgentPill component to visually indicate enabled/disabled state and handle click events for toggling the enabled state. The component should show different visual styles based on the agent's enabled state.

## Technical Approach

1. Update component styling to show enabled/disabled states using opacity and visual cues
2. Add click handling to support toggle functionality via new onClick parameter
3. Maintain existing accessibility features and keyboard navigation
4. Update AgentPillProps to accept toggle handler

## Specific Implementation Requirements

### Visual Styling

- **Enabled state**: Full opacity (1.0), normal styling
- **Disabled state**: 50% opacity (0.5), subtle visual distinction
- Add hover effects to indicate clickable state
- Maintain existing color theming and agent identification

### Props Update

```typescript
export interface AgentPillProps {
  // ... existing props ...

  /**
   * Optional handler for toggling agent enabled state.
   * Called when user clicks the pill to toggle enabled/disabled.
   * Receives the conversation agent ID for identification.
   */
  onToggleEnabled?: (conversationAgentId: string) => void;

  /**
   * Conversation agent ID for toggle operations.
   * Required when onToggleEnabled is provided.
   */
  conversationAgentId?: string;
}
```

### Component Implementation

- Update className logic to include opacity based on `agent.enabled`
- Modify click handler to call `onToggleEnabled` instead of existing `onClick`
- Update ARIA attributes for accessibility (enabled/disabled state)
- Maintain keyboard navigation (Enter/Space keys)
- Add proper cursor styling (pointer when clickable)

### Styling Classes

```typescript
className={cn(
  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all duration-150",
  agent.enabled ? "opacity-100" : "opacity-50",
  onToggleEnabled && "cursor-pointer hover:opacity-80",
  className,
)}
```

## Acceptance Criteria

- [ ] AgentPill visually indicates enabled/disabled state
- [ ] Click handling toggles enabled state via onToggleEnabled prop
- [ ] Disabled agents show 50% opacity and visual distinction
- [ ] Hover effects work correctly for clickable pills
- [ ] Keyboard navigation (Enter/Space) triggers toggle
- [ ] ARIA attributes properly indicate enabled/disabled state
- [ ] Maintains existing agent identification features
- [ ] Unit tests verify styling and interaction behavior

## Files to Modify

- `apps/desktop/src/components/chat/AgentPill.tsx`
- `packages/ui-shared/src/types/chat/AgentPillProps.ts`

## Dependencies

- Prerequisite: AgentPillViewModel must include enabled property
- Uses existing styling utilities and accessibility patterns

## Testing Requirements

- Unit tests for enabled/disabled visual states
- Test click handling and keyboard navigation
- Test accessibility attributes
- Verify hover states work correctly
- Test with different agent data scenarios

## Security Considerations

- Validate conversationAgentId parameter before use
- Ensure click handlers are properly sanitized

## Out of Scope

- Do not connect to actual toggle functionality yet
- Do not modify AgentLabelsContainerDisplay integration
