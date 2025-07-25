---
kind: task
id: T-replace-hardcoded-sidebar-with
title: Replace hardcoded sidebar with SidebarContainerDisplay components
status: open
priority: high
prerequisites: []
created: "2025-07-25T00:01:09.497110"
updated: "2025-07-25T00:01:09.497110"
schema_version: "1.1"
parent: F-layout-showcase-component
---

# Replace Hardcoded Sidebar with SidebarContainerDisplay Components

## Context

The current LayoutShowcase (apps/desktop/src/pages/showcase/LayoutShowcase.tsx:623-850) contains 200+ lines of hardcoded sidebar HTML with manual styling. This task replaces all hardcoded sidebar elements with the extracted sidebar components.

## Implementation Requirements

### Replace Hardcoded HTML Structure

Replace the current manual sidebar implementation:

```typescript
// Current: Manual sidebar with raw HTML (lines ~150-250)
<div style={styles.sidebar}>
  <div style={styles.sidebarContent}>
    <div style={styles.sidebarTitle}>Conversations</div>
    {conversations.map((conv, index) => (
      <div style={styles.conversationItem}>...hardcoded content...</div>
    ))}
  </div>
</div>
```

With composed sidebar components:

```typescript
// Target: Composed sidebar components
<SidebarContainerDisplay collapsed={isSidebarCollapsed}>
  <SidebarHeaderDisplay title="Conversations" />
  <ConversationListDisplay
    conversations={conversations}
    renderConversation={(conv) => (
      <ConversationItemDisplay
        conversation={conv}
        isActive={conv.isActive}
        contextMenu={<ConversationContextMenu
          onRename={() => handleConversationAction('rename', conv.name)}
          onDelete={() => handleConversationAction('delete', conv.name)}
        />}
      />
    )}
  />
  <SidebarToggleDisplay
    collapsed={isSidebarCollapsed}
    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
  />
</SidebarContainerDisplay>
```

### Component Integration Points

1. **SidebarContainerDisplay**: Main container with collapse state management
2. **SidebarHeaderDisplay**: Replace hardcoded title with component
3. **ConversationListDisplay**: Replace conversation mapping logic
4. **ConversationItemDisplay**: Replace individual conversation items with proper hover/active states
5. **SidebarToggleDisplay**: Replace hardcoded toggle button with component
6. **ConversationContextMenu**: Replace hardcoded context menu HTML

### Style Cleanup Requirements

Remove the following manual styling objects (estimated 100+ lines):

- `styles.sidebar`
- `styles.sidebarContent`
- `styles.sidebarTitle`
- `styles.conversationItem`
- `styles.conversationItemActive`
- `styles.conversationItemInactive`
- `styles.conversationItemHover`
- `styles.newConversation`
- `styles.newConversationHover`
- `styles.sidebarToggle`
- `styles.sidebarToggleHover`
- `styles.conversationEllipsis`
- `styles.conversationEllipsisVisible`
- `styles.conversationEllipsisHover`
- `styles.conversationContextMenu`

### Data Transformation Requirements

Transform existing conversation data structure to work with components:

```typescript
// Ensure conversation data matches ConversationItemDisplay interface
interface ConversationData {
  name: string;
  lastActivity: string;
  isActive: boolean;
}
```

### Event Handler Integration

Connect existing event handlers to new components:

- `handleConversationAction` for context menu actions
- Sidebar collapse/expand toggle functionality
- Conversation selection and active state management

## Acceptance Criteria

### ✅ **Component Integration**

- [ ] All hardcoded sidebar HTML replaced with SidebarContainerDisplay
- [ ] SidebarHeaderDisplay properly displays "Conversations" title
- [ ] ConversationListDisplay renders all conversations with proper data
- [ ] ConversationItemDisplay shows correct active/inactive states
- [ ] SidebarToggleDisplay properly controls collapse/expand
- [ ] ConversationContextMenu integrates with existing action handlers

### ✅ **Style Cleanup**

- [ ] Remove 100+ lines of sidebar-related manual styling objects
- [ ] No duplicate styling between removed styles and component styles
- [ ] Visual appearance identical to current implementation
- [ ] All hover states and transitions preserved

### ✅ **Interactive Behavior Preservation**

- [ ] Sidebar collapse/expand animation works correctly
- [ ] Conversation hover states function properly
- [ ] Active conversation highlighting works
- [ ] Context menu positioning and interactions identical
- [ ] All existing keyboard navigation preserved

### ✅ **Testing Requirements**

- [ ] Unit tests for component prop passing and data transformation
- [ ] Manual testing of all interactive behaviors
- [ ] Visual comparison with current implementation
- [ ] Cross-browser compatibility verification

## Implementation Notes

### Import Requirements

```typescript
import {
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  ConversationListDisplay,
  ConversationItemDisplay,
  SidebarToggleDisplay,
  ConversationContextMenu,
} from "@/components/sidebar";
```

### Key Files to Modify

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` (primary integration)
- Update import statements at top of file
- Replace sidebar section (approximately lines 150-250)
- Remove corresponding style objects from styles definition

### Dependencies

This task requires all sidebar components to be properly exported from the component library with correct TypeScript interfaces.

### Log
