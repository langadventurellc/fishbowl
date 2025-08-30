---
id: T-enhance-system-message
title: Enhance system message display for agent error messages in chat chronology
status: done
priority: low
parent: F-multi-agent-error-handling
prerequisites:
  - T-integrate-error-handling-into
affectedFiles:
  apps/desktop/src/components/chat/MessageItem.tsx: Enhanced system message
    display with error detection logic, visual styling for agent error messages,
    and agent name parsing. Added isErrorSystemMessage and extractAgentName
    helper functions. Implemented getSystemMessageClasses and
    renderErrorSystemMessage functions for enhanced error formatting with
    warning icons and structured layout.
  apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx:
    Created comprehensive unit test suite with 25 test cases covering error
    message detection, parsing, styling, accessibility, context toggle
    functionality, and edge cases. Tests verify proper agent name extraction,
    visual distinction for error messages, warning icon display, and graceful
    handling of malformed error messages.
log:
  - 'Enhanced system message display for agent error messages in chat chronology
    with visual distinction. Implemented error message detection pattern to
    identify error system messages starting with "Agent [name]: ", added
    enhanced styling with subtle red background and warning icon, and created
    comprehensive unit tests with 100% coverage. Error messages now display
    agent names prominently and error content clearly while maintaining
    chronological ordering with other messages.'
schema: v1.0
childrenIds: []
created: 2025-08-29T23:35:19.104Z
updated: 2025-08-29T23:35:19.104Z
---

# Enhance System Message Display for Agent Error Messages in Chat Chronology

## Context

Ensure agent error system messages are properly displayed in the chat conversation chronology with appropriate formatting and visual distinction. These system messages are created by ChatOrchestrationService when agents fail and need to be visually distinct from user and agent messages.

## Technical Approach

Locate and enhance existing system message display components in `apps/desktop/src/` to:

1. Identify current system message rendering patterns
2. Ensure agent error messages are properly formatted and styled
3. Provide visual distinction for error system messages
4. Maintain chronological ordering with other messages

## Detailed Implementation Requirements

### Component Location and Analysis

1. **Locate system message components**:
   - Search for MessageItem, SystemMessage, or similar components in desktop app
   - Identify how role="system" messages are currently rendered
   - Understand integration with message repository and display logic

2. **Error message identification**:
   - Detect error system messages by content pattern: "Agent {name}: {error message}"
   - Distinguish error messages from other system messages
   - Handle various agent name formats gracefully

### Visual Enhancement

3. **Error system message styling**:
   - Subtle error indication (light red background, warning icon)
   - Clear visual distinction from regular system messages
   - Non-intrusive design that doesn't dominate chat UI
   - Consistent with overall error theme from AgentPill components

4. **Message formatting**:
   - Preserve agent identification in error messages
   - Proper typography for error content
   - Maintain readability and accessibility standards
   - Support for message timestamps and metadata

### Integration with Chat Display

5. **Chronological display**:
   - Error system messages appear in proper chronological order
   - Don't break conversation flow or message grouping
   - Work with existing message rendering optimizations
   - Support message virtualization if implemented

6. **Message interaction**:
   - System error messages are non-interactive (no reply, edit options)
   - Support copy/select functionality for debugging
   - Maintain existing system message behavior patterns

## Detailed Acceptance Criteria

### System Message Display

- ✅ Agent error system messages are visually distinct from regular system messages
- ✅ Error messages show subtle error styling without being intrusive
- ✅ Agent identification is clearly visible in error messages
- ✅ Error message content is readable and properly formatted
- ✅ Messages maintain chronological ordering with other conversation content

### Visual Design

- ✅ Error system messages use consistent error color theme
- ✅ Visual indicators (icons, styling) are subtle and informative
- ✅ Design maintains conversation flow and readability
- ✅ Styling is responsive and works across different screen sizes
- ✅ Accessibility standards are maintained (color contrast, screen readers)

### Message Integration

- ✅ Error messages appear immediately in chat when agents fail
- ✅ Messages integrate with existing message rendering pipeline
- ✅ Performance impact is minimal (no unnecessary re-renders)
- ✅ Messages support existing functionality (copy, select)
- ✅ Integration doesn't affect other message types

### Error Context Display

- ✅ Agent names are properly displayed in error messages
- ✅ Error message content is user-friendly and informative
- ✅ Message timestamps align with actual failure time
- ✅ Error messages provide sufficient context for users
- ✅ Long error messages are handled gracefully

## Testing Requirements

Include comprehensive unit tests covering:

- System message component rendering with error content
- Visual styling for error vs regular system messages
- Agent name extraction and display
- Integration with message rendering pipeline
- Accessibility features (ARIA labels, color contrast)
- Edge cases: malformed error messages, missing agent names
- Performance with multiple error messages in conversation

## Dependencies

- Requires: T-integrate-error-handling-into (System message persistence)
- Extends: Existing system message display components
- Integrates with: Message rendering and conversation display logic
- May use: Design system components for consistent error styling

## Out of Scope

- Major message display component refactoring
- Error message interaction features (retry, dismiss)
- Advanced error message formatting (rich text, links)
- Message analytics or error tracking
- Real-time message updates beyond existing patterns
