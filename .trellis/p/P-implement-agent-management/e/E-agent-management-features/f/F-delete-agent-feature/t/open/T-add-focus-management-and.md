---
id: T-add-focus-management-and
title: Add Focus Management and Smooth Animation for Agent Deletion
status: open
priority: low
parent: F-delete-agent-feature
prerequisites:
  - T-implement-delete-confirmation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T00:52:19.123Z
updated: 2025-08-20T00:52:19.123Z
---

## Purpose

Implement focus management and smooth removal animations for agent deletion to provide a polished user experience as specified in the feature requirements.

## Context

The feature specification requires:

- "Focus Management": Move focus to appropriate element after deletion
- "Smooth Animation": Animate removal if possible
- "Empty State": Show empty state if last agent is deleted

These UX enhancements should be added after the core deletion functionality is working.

## Implementation Requirements

### 1. Focus Management After Deletion

- Determine appropriate focus target after agent deletion
- Move focus to next agent card in sequence
- If no next agent, move focus to previous agent card
- If no agents remain, move focus to "Create New Agent" button
- Ensure focus management works with keyboard navigation

### 2. Smooth Removal Animation

- Add CSS transition or animation for agent card removal
- Use existing animation patterns from the design system
- Ensure animation duration is appropriate (200-300ms)
- Prevent layout shifts during animation
- Make animation accessible (respect `prefers-reduced-motion`)

### 3. Enhanced Empty State Handling

- Ensure empty state appears smoothly when last agent is deleted
- Add appropriate focus management for empty state
- Maintain accessibility announcements for state changes

### 4. Grid Layout Considerations

- Handle grid reflow smoothly after deletion
- Ensure remaining cards animate to new positions if needed
- Maintain responsive behavior during animations

## Technical Approach

1. **Files to modify**:
   - `apps/desktop/src/components/settings/agents/LibraryTab.tsx`
   - Potentially `apps/desktop/src/components/settings/agents/AgentCard.tsx` for animation styles

2. **Animation implementation**: Use CSS transitions with Tailwind classes or CSS-in-JS

3. **Focus management pattern**:

   ```typescript
   const focusAfterDeletion = (
     deletedIndex: number,
     remainingCount: number,
   ) => {
     // Focus management logic
   };
   ```

4. **Animation pattern**: Use `transition-all duration-200 ease-in-out` or similar

5. **Accessibility**: Check for `prefers-reduced-motion` media query

## Acceptance Criteria

- [ ] Focus moves to appropriate element after agent deletion
- [ ] Agent cards animate smoothly when being removed
- [ ] Grid reflows smoothly after deletion
- [ ] Empty state appears smoothly when last agent is deleted
- [ ] Animations respect accessibility preferences
- [ ] Focus management works correctly with keyboard navigation
- [ ] Layout remains stable during animations
- [ ] Performance is maintained during animations

## Testing Requirements

Create unit tests in `apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx` that verify:

- [ ] Focus moves to correct element after deletion
- [ ] Animation classes are applied during deletion
- [ ] Empty state is properly shown when last agent is deleted
- [ ] Keyboard navigation works correctly after deletion
- [ ] Accessibility preferences are respected
- [ ] Grid layout remains stable during animations

## Security Considerations

- Ensure animations don't leak sensitive information
- Prevent animation-based timing attacks
- Maintain security during focus changes

## Dependencies

- Requires core deletion functionality from `T-implement-delete-confirmation`
- Should use existing animation patterns from the design system
- May require coordination with design system tokens
