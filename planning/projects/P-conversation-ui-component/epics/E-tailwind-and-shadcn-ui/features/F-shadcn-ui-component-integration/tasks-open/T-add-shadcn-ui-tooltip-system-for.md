---
kind: task
id: T-add-shadcn-ui-tooltip-system-for
title: Add shadcn/ui Tooltip system for enhanced UX
status: open
priority: low
prerequisites:
  - T-integrate-shadcn-ui-css
created: "2025-07-25T18:22:50.899901"
updated: "2025-07-25T18:22:50.899901"
schema_version: "1.1"
parent: F-shadcn-ui-component-integration
---

# Add shadcn/ui Tooltip System for Enhanced UX

## Context

Implement shadcn/ui Tooltip components throughout the application to provide helpful context and improve user experience. Tooltips should be added to buttons, icons, and interactive elements that benefit from additional explanation.

## Implementation Requirements

- Install shadcn/ui Tooltip component
- Identify locations where tooltips would enhance UX
- Add tooltips to button variants, especially icon-only buttons
- Implement tooltips for agent pills and status indicators
- Ensure proper accessibility with screen readers
- Create consistent tooltip styling and timing

## Detailed Steps

1. Install shadcn/ui Tooltip: `npx shadcn@latest add tooltip`
2. Identify tooltip opportunities:
   - Icon-only buttons (send button, toggle buttons)
   - Agent pills in chat interface
   - Status indicators and action buttons
   - Menu items that need additional context
3. Create tooltip wrapper patterns:
   - Button tooltip for action buttons
   - Status tooltip for indicators
   - Help tooltip for complex UI elements
4. Add tooltips to key UI elements:
   - Send button with "Send message" tooltip
   - Toggle buttons with current state description
   - Agent pills with agent information
   - Context menu triggers
5. Configure tooltip behavior:
   - Appropriate delay timing
   - Proper positioning
   - Keyboard accessibility
6. Test tooltip functionality across different screen sizes
7. Write unit tests for tooltip interactions

## Acceptance Criteria

✅ shadcn/ui Tooltip component installed  
✅ Tooltips added to icon-only buttons and controls  
✅ Agent pills enhanced with informative tooltips  
✅ Status indicators include helpful tooltip context  
✅ Proper keyboard accessibility for tooltip navigation  
✅ Consistent tooltip styling with theme system  
✅ Appropriate timing and positioning behavior  
✅ Unit tests pass for tooltip functionality  
✅ Screen reader compatibility verified

## Technical Notes

- Use Radix UI Tooltip primitives for accessibility
- Implement proper ARIA attributes for screen readers
- Consider portal rendering for proper z-index handling
- Ensure tooltips don't interfere with existing interactions

## Testing Requirements

- Unit tests for tooltip trigger and content
- Accessibility testing with screen readers
- Keyboard navigation testing for tooltip access
- Cross-browser testing for tooltip positioning

## Files to Analyze for Tooltip Integration

- `apps/desktop/src/components/input/Button.tsx` (for button tooltips)
- `apps/desktop/src/components/chat/AgentPill.tsx` (for agent information)
- `apps/desktop/src/components/input/SendButtonDisplay.tsx` (for send button)
- Other interactive components that could benefit from tooltips

## See Also

- shadcn/ui Tooltip documentation
- Accessibility guidelines for tooltip implementation
- Existing button and interactive component patterns

### Log
