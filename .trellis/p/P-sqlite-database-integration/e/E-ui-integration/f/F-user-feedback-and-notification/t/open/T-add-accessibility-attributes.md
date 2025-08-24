---
id: T-add-accessibility-attributes
title: Add accessibility attributes and screen reader support
status: open
priority: medium
parent: F-user-feedback-and-notification
prerequisites:
  - T-enhance-button-loading-states
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T02:09:56.951Z
updated: 2025-08-24T02:09:56.951Z
---

# Add accessibility attributes and screen reader support

## Context

Ensure the conversation creation flow is fully accessible to users with assistive technologies. This includes proper ARIA attributes, live regions for notifications, and screen reader announcements for state changes.

## Implementation Requirements

### 1. Add ARIA Live Regions for Notifications

- Set up aria-live regions for toast notifications
- Use "polite" for success messages
- Use "assertive" for error messages
- Ensure notifications are announced by screen readers

### 2. Enhance Button Accessibility

- Verify aria-label updates based on state
- Add aria-busy during loading state
- Include aria-disabled when appropriate
- Add descriptive labels for all states

### 3. Implement Status Announcements

- Create visually hidden status div for state changes
- Announce when conversation creation starts
- Announce success or failure results
- Use appropriate politeness levels

### 4. Keyboard Navigation Support

- Ensure button is in tab order
- Support Enter and Space key activation
- Maintain focus after operation completes
- Provide keyboard shortcuts if appropriate

## Detailed Acceptance Criteria

- [ ] Screen readers announce when creation starts
- [ ] Success notifications are read aloud
- [ ] Error messages are announced immediately
- [ ] Button state changes are communicated
- [ ] All interactive elements are keyboard accessible
- [ ] Focus management is logical and predictable
- [ ] ARIA attributes are correctly applied
- [ ] Live regions don't create duplicate announcements
- [ ] Works with major screen readers (NVDA, JAWS, VoiceOver)

## Technical Approach

```typescript
// Add screen reader only status div
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {loading && "Creating new conversation..."}
  {success && "Conversation created successfully"}
  {error && `Error: ${errorMessage}`}
</div>

// Enhanced button with ARIA
<Button
  onClick={handleClick}
  disabled={disabled || loading}
  aria-label={getAriaLabel()}
  aria-busy={loading}
  aria-describedby={error ? "error-message" : undefined}
>
  {/* Button content */}
</Button>

// Toast notifications with ARIA
<div
  role="alert"
  aria-live={type === 'error' ? 'assertive' : 'polite'}
  className={toastClasses}
>
  {message}
</div>

// Utility for screen reader only text
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Files to Modify

- `apps/desktop/src/components/conversations/NewConversationButton.tsx` - Add ARIA attributes
- `apps/desktop/src/components/ui/toast.tsx` - Add ARIA live regions
- `apps/desktop/src/pages/Home.tsx` - Add status announcements
- `apps/desktop/src/styles/globals.css` - Add sr-only utility class

## Testing Requirements

### Unit Tests (include in this task)

- Test ARIA attributes are present
- Test aria-label changes with state
- Test aria-busy during loading
- Test role="alert" on error toasts
- Verify live region politeness levels
- Test keyboard event handlers

### Manual Testing with Screen Reader

- Test with NVDA on Windows
- Test with VoiceOver on macOS
- Navigate with keyboard only
- Verify all states are announced
- Check for duplicate announcements
- Test notification announcements
- Verify focus management

## Dependencies

- Core functionality is working
- Toast system is implemented
- Button states are properly managed

## Accessibility Standards

- Follow WCAG 2.1 Level AA guidelines
- Ensure 4.5:1 contrast ratio for text
- Support keyboard-only navigation
- Provide text alternatives for all UI states
- Test with actual assistive technologies

## Time Estimate

1.5-2 hours including screen reader testing
