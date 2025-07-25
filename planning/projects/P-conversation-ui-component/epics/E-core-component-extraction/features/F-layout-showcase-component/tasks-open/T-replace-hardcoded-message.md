---
kind: task
id: T-replace-hardcoded-message
title: Replace hardcoded message rendering with MessageItem components
status: open
priority: high
prerequisites: []
created: "2025-07-25T00:01:35.596182"
updated: "2025-07-25T00:01:35.596182"
schema_version: "1.1"
parent: F-layout-showcase-component
---

# Replace Hardcoded Message Rendering with MessageItem Components

## Context

The current LayoutShowcase contains 300+ lines of hardcoded message rendering with manual styling (lines ~400-700). This task replaces all manual message HTML with the extracted MessageItem components while preserving all interactive behaviors.

## Implementation Requirements

### Replace Manual Message Rendering

Replace the current manual message implementation:

```typescript
// Current: Manual message rendering with raw HTML
{messages.map((message) => {
  if (message.type === 'system') {
    return (
      <div key={message.id} style={styles.systemMessage}>
        {message.content}
      </div>
    );
  }

  return (
    <div key={message.id} style={styles.messageWrapper}>
      <div style={styles.contextToggle}>...</div>
      <div style={styles.messageHeader}>...</div>
      <div style={styles.messageContent}>...</div>
      <button style={styles.ellipsisButton}>...</button>
    </div>
  );
})}
```

With MessageItem components:

```typescript
// Target: MessageItem components
{messages.map((message) => (
  <MessageItem
    key={message.id}
    message={message}
    onToggleContext={() => toggleMessageContext(message.id)}
    onMenuAction={(action) => handleContextMenuAction(action, message.id)}
    isExpanded={expandedMessages.has(message.id)}
    onToggleExpansion={() => toggleMessageExpansion(message.id)}
    contextMenu={<MessageContextMenu
      onCopy={() => handleContextMenuAction('copy', message.id)}
      onRegenerate={() => handleContextMenuAction('regenerate', message.id)}
      onDelete={() => handleContextMenuAction('delete', message.id)}
    />}
  />
))}
```

### Component Integration Points

1. **MessageItem**: Main message container with all interactive behaviors
2. **MessageHeader**: Agent name, role, and timestamp display
3. **MessageContent**: Message text with expand/collapse functionality
4. **MessageAvatar**: Agent avatar display (for visual consistency)
5. **MessageContextMenu**: Replace hardcoded context menu HTML
6. **ThinkingIndicator**: For agents currently thinking

### Style Cleanup Requirements

Remove the following manual styling objects (estimated 200+ lines):

- `styles.message`
- `styles.messageInactive`
- `styles.systemMessage`
- `styles.messageWrapper`
- `styles.messageWrapperHover`
- `styles.contextToggle`
- `styles.contextToggleActive`
- `styles.contextToggleInactive`
- `styles.userMessage`
- `styles.messageHeader`
- `styles.messageContent`
- `styles.showMoreLink`
- `styles.ellipsisButton`
- `styles.ellipsisButtonHover`
- `styles.contextMenu`
- `styles.contextMenuItem`
- `styles.contextMenuItemHover`

### Data Transformation Requirements

Ensure message data structure works with MessageItem components:

```typescript
interface MessageData {
  id: string;
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  type: "user" | "agent" | "system";
  isActive: boolean;
  agentColor: string;
}
```

### Event Handler Integration

Connect existing event handlers to MessageItem components:

- `toggleMessageContext(messageId)` for in/out of context functionality
- `toggleMessageExpansion(messageId)` for long message expand/collapse
- `handleContextMenuAction(action, messageId)` for context menu actions
- Proper prop passing for message state management

## Acceptance Criteria

### ✅ **Component Integration**

- [ ] All hardcoded message HTML replaced with MessageItem components
- [ ] MessageHeader properly displays agent name, role, timestamp
- [ ] MessageContent handles expand/collapse for long messages correctly
- [ ] MessageAvatar displays consistent with agent colors
- [ ] MessageContextMenu integrates with existing action handlers
- [ ] System messages render correctly with appropriate styling
- [ ] ThinkingIndicator shows for agents with isThinking: true

### ✅ **Style Cleanup**

- [ ] Remove 200+ lines of message-related manual styling objects
- [ ] No duplicate styling between removed styles and component styles
- [ ] Visual appearance identical to current implementation
- [ ] All message type differentiation preserved (user/agent/system)

### ✅ **Interactive Behavior Preservation**

- [ ] Context toggle functionality (in/out of context) works identically
- [ ] Message expansion/collapse for long messages functions properly
- [ ] Context menu interactions (copy, regenerate, delete) work correctly
- [ ] Message hover states and transitions preserved
- [ ] Inactive message opacity effects maintained
- [ ] All keyboard navigation and focus states preserved

### ✅ **Message Type Handling**

- [ ] User messages render with correct styling and behavior
- [ ] Agent messages display with proper agent colors and roles
- [ ] System messages show with appropriate centered styling
- [ ] Message timestamps format correctly
- [ ] Agent thinking indicators display properly

### ✅ **Testing Requirements**

- [ ] Unit tests for MessageItem prop passing and event handlers
- [ ] Manual testing of all message interactions
- [ ] Visual comparison with current message rendering
- [ ] Test long message expansion/collapse functionality
- [ ] Verify context menu positioning and actions

## Implementation Notes

### Import Requirements

```typescript
import {
  MessageItem,
  MessageHeader,
  MessageContent,
  MessageAvatar,
  MessageContextMenu,
  ThinkingIndicator,
} from "@/components/chat";
```

### Key Files to Modify

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` (primary integration)
- Replace message rendering section (approximately lines 400-700)
- Update message mapping logic to use MessageItem components
- Remove corresponding style objects from styles definition

### Helper Function Updates

Update or remove these message-related helper functions:

- `formatTimestamp(timestamp)` - may be handled by MessageHeader component
- `isLongMessage(content)` - may be handled by MessageContent component
- `getMessagePreview(content)` - may be handled by MessageContent component

### Dependencies

This task requires all chat components to be properly exported from the component library with correct TypeScript interfaces and support for the current message data structure.

### Log
