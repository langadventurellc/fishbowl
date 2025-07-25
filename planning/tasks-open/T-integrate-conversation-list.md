---
kind: task
id: T-integrate-conversation-list
status: open
title: Integrate conversation list management into SidebarContainerDisplay component
priority: normal
prerequisites: []
created: "2025-07-25T14:32:55.591244"
updated: "2025-07-25T14:34:53.293518"
schema_version: "1.1"
worktree: null
---

## Context

Currently in `ConversationLayoutDisplay.tsx`, the sidebar components are manually composed as children of the `SidebarContainerDisplay` component:

- `SidebarHeaderDisplay` (lines 56-60)
- Conversation list container and mapping (lines 62-80)
- "New Conversation" button (lines 82-91)

This creates tight coupling where the layout component needs to orchestrate multiple sidebar concerns. The goal is to make `SidebarContainerDisplay` completely self-contained by moving ALL sidebar content into the component itself.

## Current Implementation

**ConversationLayoutDisplay.tsx** currently manages sidebar children manually:

```tsx
<SidebarContainerDisplay
  collapsed={isSidebarCollapsed}
  widthVariant="default"
  showBorder={true}
>
  <SidebarHeaderDisplay
    title="Conversations"
    showControls={true}
    collapsed={isSidebarCollapsed}
  />

  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minHeight: "120px",
    }}
  >
    {conversations.map((conv, index) => (
      <ConversationItemDisplay
        key={index}
        conversation={conv}
        appearanceState={conv.isActive ? "active" : "inactive"}
        showUnreadIndicator={false}
      />
    ))}
  </div>

  <div style={{ marginTop: "auto" }}>
    <Button
      variant="primary"
      size="small"
      onClick={() => console.log("Demo: New conversation")}
    >
      New Conversation
    </Button>
  </div>
</SidebarContainerDisplay>
```

**SidebarContainerDisplay.tsx** - Currently accepts generic `children` prop and renders them when not collapsed.

## Implementation Requirements

### 1. Update Type Definitions

Modify `SidebarContainerDisplayProps.ts` to add:

```tsx
/**
 * Optional conversations array for self-contained sidebar rendering
 * When provided, component renders complete sidebar with header, conversation list, and create button
 */
conversations?: Conversation[];

/**
 * Callback for conversation selection events
 */
onConversationSelect?: (conversation: Conversation) => void;

/**
 * Callback for new conversation creation
 */
onCreateConversation?: () => void;
```

### 2. Update SidebarContainerDisplay Component

**File**: `/Users/zach/code/fishbowl/apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`

**Complete self-contained sidebar when `conversations` prop is provided:**

- Import required dependencies: `SidebarHeaderDisplay`, `ConversationItemDisplay`, `Button`, `Conversation` type
- Add conditional rendering logic: when `conversations` prop is provided, render complete sidebar structure instead of `children`
- Include ALL sidebar content:
  - `SidebarHeaderDisplay` with title "Conversations", showControls=true, collapsed state
  - Conversation list container with proper styling (flex: 1, gap: 4px, minHeight: 120px)
  - Map conversations to `ConversationItemDisplay` components with proper props (active/inactive states)
  - "New Conversation" button at bottom with marginTop: "auto"
- Handle conversation selection via `onConversationSelect` callback
- Handle new conversation creation via `onCreateConversation` callback
- Maintain backward compatibility: when `conversations` is not provided, render `children` as before

### 3. Update ConversationLayoutDisplay Component

**File**: `/Users/zach/code/fishbowl/apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`

**Simplified sidebar usage:**

- Remove all manual sidebar children (lines 56-91)
- Pass `conversations` prop directly to `SidebarContainerDisplay`
- Add conversation selection and creation handlers
- Result: `ConversationLayoutDisplay` should only contain `SidebarToggleDisplay` and `SidebarContainerDisplay` with conversations prop
- No more manual composition of sidebar children

### 4. Build Shared Package

- Run `pnpm build:libs` after type changes to rebuild shared package
- Ensure all apps can import updated types from `@fishbowl-ai/shared`

## Acceptance Criteria

- [ ] `SidebarContainerDisplay` accepts optional `conversations` prop
- [ ] When `conversations` provided, component renders complete self-contained sidebar (header + list + button)
- [ ] `SidebarHeaderDisplay` included automatically with title "Conversations" and showControls=true
- [ ] `ConversationItemDisplay` components maintain correct appearance states (active/inactive)
- [ ] "New Conversation" button included at bottom with proper styling (marginTop: "auto")
- [ ] Conversation selection functionality works via `onConversationSelect` callback prop
- [ ] New conversation creation works via `onCreateConversation` callback prop
- [ ] Backward compatibility maintained: `children` prop still works when `conversations` not provided
- [ ] `ConversationLayoutDisplay` simplified to only contain SidebarToggleDisplay and SidebarContainerDisplay with conversations prop
- [ ] All TypeScript types compile without errors after `pnpm build:libs`
- [ ] Visual appearance and layout identical to current implementation
- [ ] Component maintains proper responsive behavior and theming

## Technical Approach

1. **Types First**: Update shared types for new props structure
2. **Component Logic**: Add conditional rendering in SidebarContainerDisplay
3. **Integration**: Update ConversationLayoutDisplay to use new prop interface
4. **Build**: Rebuild shared packages for type propagation
5. **Verification**: Ensure visual parity and functionality

## Dependencies

- Requires access to `ConversationItemDisplay` component
- Must maintain compatibility with existing `SidebarHeaderDisplay` integration
- Depends on shared type definitions in `@fishbowl-ai/shared` package

## Testing Requirements

- [ ] Visual regression test to ensure layout appearance unchanged
- No automated tests required for this task

### Log
