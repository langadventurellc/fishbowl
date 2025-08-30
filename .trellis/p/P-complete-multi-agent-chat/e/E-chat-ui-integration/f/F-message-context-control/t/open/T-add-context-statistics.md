---
id: T-add-context-statistics
title: Add context statistics display component
status: open
priority: medium
parent: F-message-context-control
prerequisites:
  - T-wire-messageitem-checkboxes
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T06:20:19.202Z
updated: 2025-08-30T06:20:19.202Z
---

# Add context statistics display component

## Context

Users need visual feedback about how message inclusion affects the conversation context. This requires a new component to display context statistics like "X messages included in context" and show warnings when no messages are included.

## Technical Implementation

**Files to create:**

- `apps/desktop/src/components/chat/ContextStatistics.tsx`
- `apps/desktop/src/components/chat/__tests__/ContextStatistics.test.tsx`

**Files to modify:**

- `packages/ui-shared/src/types/chat/ContextStatisticsProps.ts` (create new interface)
- `packages/ui-shared/src/types/chat/index.ts` (add export)
- `apps/desktop/src/components/chat/index.ts` (add export)

### Step 1: Create ContextStatisticsProps interface

- Define props interface with messages array and optional styling props
- Include clear documentation and examples in TypeScript comments

### Step 2: Create ContextStatistics component

- Calculate included message count from props
- Display context statistics with appropriate styling
- Show warning states when no messages are included
- Use existing design system components and patterns

### Step 3: Add comprehensive unit tests

- Test message counting logic with various message arrays
- Test warning display when no messages included
- Test styling and accessibility features

## Component Requirements

### Context Statistics Display

- Show total count of included messages (e.g., "12 messages included in context")
- Display different states: normal count, empty warning, single message info
- Use consistent styling with existing chat components

### Visual Design

- Subtle, non-intrusive display that doesn't compete with messages
- Use muted text colors and appropriate spacing
- Show warning icon/color when context is empty

### Accessibility

- Proper ARIA labels for screen readers
- Clear text descriptions of context state
- Keyboard navigation support if interactive elements added

## Detailed Acceptance Criteria

### Message Counting

- **GIVEN** array of messages with mixed inclusion states
- **WHEN** component renders
- **THEN** it should display accurate count of included messages
- **AND** count should update when message inclusion changes

### Empty Context Warning

- **GIVEN** no messages are included in context
- **WHEN** displaying context statistics
- **THEN** show warning message like "No messages included in context"
- **AND** use appropriate warning styling (orange/yellow theme)

### Normal Context Display

- **GIVEN** one or more messages included
- **WHEN** displaying statistics
- **THEN** show count like "5 messages included in context"
- **AND** use standard muted text styling

### Responsive Design

- **WHEN** component is rendered in different container sizes
- **THEN** text should wrap appropriately and maintain readability

## Testing Requirements

Include unit tests for:

- Message counting with various arrays (empty, all included, mixed, all excluded)
- Warning state display and styling
- Component props handling and default values
- Accessibility features (ARIA labels, screen reader content)

## Implementation Notes

- Keep the component stateless and focused on display logic
- Use existing UI patterns from the chat components
- Follow the project's accessibility guidelines
- Use TypeScript for proper type safety

## Out of Scope

- Do not add interactive features (buttons, links) to this component
- Do not integrate with ChatContainerDisplay in this task
- Do not add context size estimation or token counting
- Do not add bulk operation controls
