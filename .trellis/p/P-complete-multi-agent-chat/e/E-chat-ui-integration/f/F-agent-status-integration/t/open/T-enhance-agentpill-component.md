---
id: T-enhance-agentpill-component
title: Enhance AgentPill component with chat store integration and status display
status: open
priority: high
parent: F-agent-status-integration
prerequisites:
  - T-update-agentpillviewmodel
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T04:59:36.124Z
updated: 2025-08-30T04:59:36.124Z
---

# Enhance AgentPill Component with Status Integration

## Context

Connect the existing AgentPill component to useChatStore to display real-time agent processing states. The component should show thinking indicators, error states, and completion feedback with simple CSS-only tooltips for error messages.

## Detailed Implementation Requirements

### Component Integration

**File**: `apps/desktop/src/components/chat/AgentPill.tsx`

#### Add Chat Store Integration

1. Import and use `useChatStore` hook to get agent state:

   ```typescript
   const { agentThinking, lastError } = useChatStore();
   ```

2. Add `conversationAgentId` as required prop when status integration is needed
3. Derive agent status from store state and agent props

#### Status Display Logic

Implement status determination:

- `thinking`: `agentThinking[conversationAgentId] === true`
- `error`: `lastError[conversationAgentId] !== null`
- `complete`: Recently finished processing (thinking was true, now false)
- `idle`: Default state

#### Visual Indicators

1. **Thinking State**: Enhanced animated indicator (replace current simple pulse)
   - Use animated dots or spinner instead of single pulsing dot
   - CSS keyframe animation for smooth 60fps performance
   - Position: right side of agent name/role text

2. **Error State**:
   - Red error indicator icon (⚠️ or similar)
   - Error styling: red border or background tint
   - CSS-only tooltip on hover showing error message

3. **Complete State** (brief feedback):
   - Green checkmark or success indicator for 2-3 seconds
   - Subtle green tint or border
   - Auto-clear after timeout

### CSS-Only Error Tooltips

Implement simple hover tooltips using CSS:

```css
.agent-pill-error {
  position: relative;
}

.agent-pill-error::after {
  content: attr(data-error-message);
  position: absolute;
  /* tooltip positioning and styling */
}
```

### Accessibility Enhancements

- Update ARIA labels to include current status
- Screen reader announcements for status changes
- Proper keyboard navigation for error information

## Technical Approach

1. Add optional `showStatus?: boolean` prop to enable status integration
2. When `showStatus` is true, require `conversationAgentId` prop
3. Use conditional rendering for different status states
4. Implement CSS animations with proper performance optimization
5. Add data attributes for CSS-only tooltips

## Acceptance Criteria

- [ ] Component connects to useChatStore when `showStatus={true}`
- [ ] Thinking indicators display with smooth CSS animations
- [ ] Error states show red styling with hover tooltips
- [ ] Complete states show brief success feedback
- [ ] CSS tooltips display error messages on hover
- [ ] ARIA labels update to reflect current agent status
- [ ] No JavaScript performance issues with animations
- [ ] Backward compatibility maintained for existing usage
- [ ] Unit tests cover all status display logic and store integration

## Dependencies

- Requires T-update-agentpillviewmodel (interface updates)
- useChatStore already exists with required state management

## Security Considerations

- Only display user-safe error messages in tooltips
- Escape error message content to prevent XSS
- No sensitive system information exposed in UI

## Testing Requirements

Include comprehensive unit tests:

- Status derivation from chat store state
- Visual indicator rendering for each status
- CSS tooltip functionality
- Accessibility features and ARIA updates
- Store integration and state synchronization
- Error message sanitization and display

## Out of Scope

- No complex tooltip libraries or third-party components
- No performance optimizations beyond standard React.memo
- No animation libraries - pure CSS animations only
