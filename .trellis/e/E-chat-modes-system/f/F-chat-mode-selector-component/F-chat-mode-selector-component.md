---
id: F-chat-mode-selector-component
title: Chat Mode Selector Component
status: done
priority: medium
parent: E-chat-modes-system
prerequisites:
  - F-state-management-integration
affectedFiles:
  apps/desktop/src/components/chat/ChatModeSelector.tsx: "New React component
    implementing chat mode selector dropdown with shadcn/ui Select components,
    TypeScript interface, accessibility features, error handling prop, and
    comprehensive JSDoc documentation; Enhanced with comprehensive accessibility
    features: proper aria-describedby linkage, aria-invalid attributes, error
    styling, aria-live regions, and improved JSDoc documentation covering error
    handling and loading state integration"
  apps/desktop/src/components/chat/index.ts: Added ChatModeSelector export to barrel file for consistent import patterns
  apps/desktop/src/components/chat/__tests__/ChatModeSelector.test.tsx:
    Comprehensive test suite with 25 test cases covering component rendering,
    user interactions, keyboard navigation, null value handling, accessibility,
    edge cases, and TypeScript type safety; Added comprehensive test suite (12
    new tests) covering error handling, loading states, accessibility
    attributes, race condition protection, and visual feedback scenarios
  apps/desktop/src/setupTests.ts: Added scrollIntoView mock for Radix UI
    components to fix test environment compatibility
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Integrated ChatModeSelector component with useConversationStore methods
    (getActiveChatMode, setChatMode), error filtering for chat mode save
    operations, conditional rendering when selectedConversationId exists, and
    proper positioning with ml-auto class; Updated error filtering logic to use
    message-based filtering (checking for 'chat mode' text) instead of
    operation-only filtering for better error specificity
  apps/desktop/src/components/layout/__tests__/AgentLabelsContainerDisplay.test.tsx:
    Created comprehensive test suite with 15 test cases covering
    ChatModeSelector integration scenarios, error handling, layout preservation,
    and existing functionality verification; Updated and enhanced tests to cover
    message-based error filtering, ensuring proper distinction between chat mode
    errors and other save operation errors
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Updated error message in setChatMode method to 'Failed to update chat mode:'
    for better identification and consistency
  packages/ui-shared/src/stores/index.ts: Added ErrorState type export to fix import issues in desktop app components
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Fixed ErrorState import to use shared type instead of duplicate interface
    definition
  packages/ui-shared/src/stores/conversation/__tests__/setChatMode.test.ts:
    Updated test expectations to match new error message format ('Failed to
    update chat mode:' instead of 'Failed to change chat mode:')
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-chatmodeselector
  - T-implement-error-handling-and
  - T-integrate-chatmodeselector
created: 2025-09-03T18:36:06.399Z
updated: 2025-09-03T18:36:06.399Z
---

# Chat Mode Selector Component Feature

## Overview

Create a user interface component for selecting between Manual and Round Robin chat modes. This feature provides the UI layer for mode selection and integrates with the Agent Labels Container Display component following existing design patterns.

## Functionality

### Chat Mode Selector Component

- Dropdown component for selecting between 'Manual' and 'Round Robin' modes
- Integration with existing shadcn/ui components for consistency
- Accessible design following WCAG 2.1 AA guidelines
- Real-time mode switching with immediate visual feedback

### Agent Labels Container Integration

- Add ChatModeSelector to the far right of the Agent Labels Container Display
- Maintain existing layout and spacing patterns
- Ensure responsive behavior across different screen sizes
- Preserve all existing functionality of agent pills and add button

## Acceptance Criteria

### Component Implementation

- [ ] **ChatModeSelector Component**: Self-contained React component with proper TypeScript definitions
- [ ] **Dropdown Interface**: Uses shadcn/ui Select component for consistency with existing UI patterns
- [ ] **Mode Options**: Displays 'Manual' and 'Round Robin' options with descriptive labels
- [ ] **Current Mode Display**: Shows currently selected mode prominently
- [ ] **Real-time Updates**: Reflects mode changes immediately when updated from other sources
- [ ] **Naming Consistency**: Uses 'round-robin' consistently with backend and displays as 'Round Robin'

### User Interaction

- [ ] **Mode Selection**: Users can select between Manual and Round Robin modes
- [ ] **Immediate Feedback**: UI updates immediately upon mode selection (optimistic updates)
- [ ] **Loading States**: Shows appropriate loading indicators during mode changes
- [ ] **Error Handling**: Displays error messages if mode changes fail
- [ ] **Store Integration**: Uses `getActiveChatMode()` and `setChatMode()` from store

### Integration with Agent Labels Container

- [ ] **Layout Integration**: Positioned at far right of Agent Labels Container Display
- [ ] **Spacing Consistency**: Maintains existing gap and padding patterns
- [ ] **Responsive Design**: Adapts to different container widths appropriately
- [ ] **Z-index Management**: Dropdown properly overlays other elements
- [ ] **No Layout Disruption**: Existing agent pills and add button remain unaffected

### Accessibility Requirements

- [ ] **Keyboard Navigation**: Full keyboard navigation support (Tab, Enter, Arrow keys)
- [ ] **Screen Reader Support**: Proper ARIA labels and descriptions
- [ ] **Focus Management**: Clear focus indicators and logical tab order
- [ ] **Color Contrast**: Meets WCAG 2.1 AA color contrast requirements
- [ ] **Alternative Text**: Descriptive text for all interactive elements

### Testing Requirements

- [ ] **Component Tests**: Unit tests for all user interactions and state changes
- [ ] **Integration Tests**: Tests with Agent Labels Container Display component
- [ ] **Accessibility Tests**: Screen reader and keyboard navigation testing
- [ ] **Visual Tests**: Consistent styling across different states and themes
- [ ] **Error Tests**: Component behavior during error states and recovery

## Implementation Guidance

### Component Structure

```tsx
// ChatModeSelector.tsx
interface ChatModeSelectorProps {
  value: "manual" | "round-robin" | null;
  onValueChange: (mode: "manual" | "round-robin") => void;
  disabled?: boolean;
  className?: string;
}

export const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  className,
}) => {
  return (
    <Select
      value={value || "manual"}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn("w-40", className)}
        aria-label="Chat mode selection"
      >
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="manual">
          <div className="flex flex-col">
            <span>Manual</span>
            <span className="text-xs text-muted-foreground">
              Full control over agent participation
            </span>
          </div>
        </SelectItem>
        <SelectItem value="round-robin">
          <div className="flex flex-col">
            <span>Round Robin</span>
            <span className="text-xs text-muted-foreground">
              Agents take turns automatically
            </span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
```

### Agent Labels Container Integration

```tsx
// AgentLabelsContainerDisplay.tsx updates
export const AgentLabelsContainerDisplay = (
  {
    /* existing props */
  },
) => {
  const { getActiveChatMode, setChatMode, loading } = useConversationStore();
  const activeChatMode = getActiveChatMode();

  return (
    <div className="flex items-center overflow-y-hidden" style={dynamicStyles}>
      {/* Existing agent pills */}
      <div className="flex items-center gap-2">
        {displayAgents.map(/* existing mapping */)}
        {canAddAgent && (
          <AddAgentButton onClick={handleAddAgent} disabled={!canAddAgent} />
        )}
      </div>

      {/* Chat mode selector */}
      {selectedConversationId && (
        <div className="ml-auto">
          <ChatModeSelector
            value={activeChatMode}
            onValueChange={setChatMode}
            disabled={loading.agents}
          />
        </div>
      )}
    </div>
  );
};
```

### Files to Create/Modify

- `apps/desktop/src/components/chat/ChatModeSelector.tsx` (new)
- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

### Styling Considerations

- **Component Width**: Fixed width (~160px) to prevent layout shifts
- **Dropdown Width**: Wide enough for descriptive text without truncation
- **Color Scheme**: Follows existing theme variables and dark/light mode support
- **Typography**: Consistent with existing component text sizing
- **Hover States**: Subtle hover effects matching other interactive elements

### Security Considerations

- **Input Validation**: Validate mode values before passing to store actions
- **XSS Prevention**: Properly escape any user-visible text
- **State Consistency**: Ensure UI state matches backend state

### Performance Requirements

- **Render Time**: Component renders in <16ms for 60fps
- **Bundle Impact**: Minimal increase in JavaScript bundle size
- **Re-render Optimization**: Efficient re-rendering on state changes
- **Memory Usage**: No memory leaks from event listeners

### Error Handling

```tsx
// Error state handling integrated with store
const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  value,
  onValueChange,
  disabled,
  className,
}) => {
  const { error } = useConversationStore();
  const chatModeError =
    error.agents?.operation === "chat_mode_update" ? error.agents : null;

  return (
    <div className="flex flex-col">
      <Select
        value={value || "manual"}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        {/* Select content */}
      </Select>

      {chatModeError && (
        <div className="text-sm text-destructive mt-1" role="alert">
          {chatModeError.message}
        </div>
      )}
    </div>
  );
};
```

## Dependencies

- `F-state-management-integration` (requires `getActiveChatMode()` and `setChatMode()` store methods)

## Success Metrics

- [ ] Component renders correctly in all browsers and screen sizes
- [ ] Mode selection works reliably with immediate visual feedback using 'round-robin'
- [ ] Integration with Agent Labels Container maintains existing functionality
- [ ] Accessibility audit passes WCAG 2.1 AA requirements
- [ ] Performance benchmarks met for render time and bundle size
- [ ] Error states from store properly displayed and handled
