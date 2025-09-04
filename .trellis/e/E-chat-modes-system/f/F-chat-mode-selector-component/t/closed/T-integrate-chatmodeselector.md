---
id: T-integrate-chatmodeselector
title: Integrate ChatModeSelector into AgentLabelsContainerDisplay component
status: done
priority: high
parent: F-chat-mode-selector-component
prerequisites:
  - T-create-chatmodeselector
affectedFiles:
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Integrated ChatModeSelector component with useConversationStore methods
    (getActiveChatMode, setChatMode), error filtering for chat mode save
    operations, conditional rendering when selectedConversationId exists, and
    proper positioning with ml-auto class
  apps/desktop/src/components/layout/__tests__/AgentLabelsContainerDisplay.test.tsx:
    Created comprehensive test suite with 15 test cases covering
    ChatModeSelector integration scenarios, error handling, layout preservation,
    and existing functionality verification
log:
  - Successfully integrated ChatModeSelector into AgentLabelsContainerDisplay
    component with full store integration, error handling, and comprehensive
    test coverage. The selector is positioned at the far right of the container
    using ml-auto class and only appears when a conversation is selected. All
    existing functionality for agent pills and add button remains preserved.
schema: v1.0
childrenIds: []
created: 2025-09-03T22:27:19.783Z
updated: 2025-09-03T22:27:19.783Z
---

# Integrate ChatModeSelector into AgentLabelsContainerDisplay

## Context

Add the ChatModeSelector component to the far right of the Agent Labels Container Display, integrating with the conversation store to enable chat mode selection while preserving all existing functionality.

## Implementation Requirements

### File Location

- **Target File**: `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`
- **Integration Point**: Position ChatModeSelector at the far right using `ml-auto` class

### Store Integration

- **Store Hook**: Use `useConversationStore()` to access chat mode methods
- **Required Methods**: `getActiveChatMode()`, `setChatMode()`, and `loading.agents`
- **Error Handling**: Access `error.agents` for chat mode update error display

### Layout Integration

```tsx
// Layout structure to implement
<div className="flex items-center overflow-y-hidden" style={dynamicStyles}>
  {/* Existing agent pills and add button */}
  <div className="flex items-center gap-2">
    {displayAgents.map(/* existing mapping */)}
    {canAddAgent && (
      <AddAgentButton onClick={handleAddAgent} disabled={!canAddAgent} />
    )}
  </div>

  {/* New chat mode selector - only when conversation is selected */}
  {selectedConversationId && (
    <div className="ml-auto">
      <ChatModeSelector
        value={activeChatMode}
        onValueChange={setChatMode}
        disabled={loading.agents}
        error={
          error.agents?.operation === "chat_mode_update" ? error.agents : null
        }
      />
    </div>
  )}
</div>
```

### Error Integration

- **Error Filtering**: Show only chat mode update errors (`error.agents?.operation === "chat_mode_update"`)
- **Error Display**: Pass filtered error to ChatModeSelector for inline display
- **Error Recovery**: Component should handle error clearing on successful updates

### Conditional Rendering

- **Show When**: `selectedConversationId` exists (conversation is active)
- **Hide When**: No active conversation or in conversation loading states
- **Responsive Behavior**: Maintain existing responsive patterns

### Preserve Existing Functionality

- **Agent Pills**: All existing agent pill rendering and interaction logic
- **Add Button**: Existing AddAgentButton functionality and positioning
- **Overflow Handling**: Existing overflow-y-hidden behavior
- **Dynamic Styles**: Preserve existing dynamicStyles application
- **Event Handlers**: All existing event handlers remain unchanged

## Unit Testing Requirements

### Integration Tests

- **Component Rendering**: Test ChatModeSelector renders when conversation selected
- **Conditional Logic**: Test component hidden when no selectedConversationId
- **Store Integration**: Test getActiveChatMode and setChatMode integration
- **Error Handling**: Test error prop filtering and display
- **Layout Preservation**: Test existing agent pills and add button still work

### Accessibility Tests

- **Focus Management**: Test tab order includes ChatModeSelector appropriately
- **Keyboard Navigation**: Test keyboard access doesn't disrupt existing patterns
- **Screen Reader**: Test component integration doesn't break existing accessibility

## Acceptance Criteria

- [ ] ChatModeSelector imported and positioned at far right with `ml-auto`
- [ ] Integration with `useConversationStore()` for `getActiveChatMode()` and `setChatMode()`
- [ ] Conditional rendering only when `selectedConversationId` exists
- [ ] Error filtering for chat mode specific errors (`operation === "chat_mode_update"`)
- [ ] Loading state integration using `loading.agents` to disable selector
- [ ] All existing agent pills and add button functionality preserved
- [ ] No disruption to existing layout, spacing, or responsive behavior
- [ ] Unit tests cover integration scenarios and error handling
- [ ] Accessibility tests verify tab order and keyboard navigation
- [ ] Component properly handles conversation changes (active mode updates)

## Dependencies

- Completed ChatModeSelector component (T-create-chatmodeselector)
- Existing `useConversationStore` with `getActiveChatMode()` and `setChatMode()` methods
- Current AgentLabelsContainerDisplay component structure

## Out of Scope

- Modifications to the store methods (assumed working from state management integration)
- Changes to existing agent management logic
- Visual design changes beyond adding the selector
- Mobile responsive behavior (desktop app focus)
