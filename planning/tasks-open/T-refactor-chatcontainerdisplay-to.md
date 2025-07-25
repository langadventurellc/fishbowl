---
kind: task
id: T-refactor-chatcontainerdisplay-to
title: Refactor ChatContainerDisplay to accept Message array instead of children
status: open
priority: normal
prerequisites: []
created: "2025-07-25T15:49:23.040349"
updated: "2025-07-25T15:49:23.040349"
schema_version: "1.1"
---

## Context

The `ChatContainerDisplay` component currently accepts `messages?: React.ReactNode[]` (an array of pre-rendered components) and consumers must manually map `Message[]` data to `<MessageItem>` components before passing them. This creates unnecessary coupling and duplication across usage sites.

## Requirements

Refactor the `ChatContainerDisplay` component to accept raw message data directly and handle the creation of `MessageItem` components internally.

## Technical Approach

### 1. Update ChatContainerDisplayProps Interface

**File:** `packages/shared/src/types/ui/components/ChatContainerDisplayProps.ts`

- Change `messages?: React.ReactNode[]` to `messages?: Message[]`
- Add `onContextMenuAction?: (action: string, messageId: string) => void` prop
- Import `Message` type from `../core/Message`
- Update JSDoc comments to reflect the new behavior

### 2. Update ChatContainerDisplay Implementation

**File:** `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`

- Import `MessageItem` component from `../chat`
- Update the `renderContent()` function to map `Message[]` to `<MessageItem>` components
- Set `canRegenerate={message.type === "agent"}` internally
- Pass through the `onContextMenuAction` prop to each `MessageItem`
- Ensure proper `key` prop using `message.id`

### 3. Update MainContentPanelDisplay Usage

**File:** `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

- Remove the manual mapping from `messages.map((message) => <MessageItem ...>)`
- Pass `messages` prop directly to `ChatContainerDisplay`
- Add `onContextMenuAction={() => {}}` prop (empty handler for now)
- Remove the `MessageItem` import if no longer needed

### 4. Update ComponentShowcase Usage

**File:** `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`

- Create sample `Message[]` data instead of manually creating `<MessageItem>` components
- Update any `ChatContainerDisplay` usage to pass message data directly
- Add `onContextMenuAction` prop where needed

### 5. Rebuild Shared Package

- Run `pnpm build:libs` to rebuild the shared package after type changes
- Verify no type errors in dependent applications

## Acceptance Criteria

✅ **Interface Updated**: `ChatContainerDisplayProps` accepts `messages?: Message[]` instead of `React.ReactNode[]`

✅ **Context Menu Support**: Component accepts `onContextMenuAction` callback prop

✅ **Internal Message Creation**: `ChatContainerDisplay` internally creates `MessageItem` components with proper props

✅ **Regeneration Logic**: Component sets `canRegenerate={message.type === "agent"}` internally

✅ **MainContentPanelDisplay Updated**: Usage simplified to pass raw message data

✅ **ComponentShowcase Updated**: All showcase usage updated to use new interface

✅ **Type Safety**: No TypeScript errors after shared package rebuild

✅ **Functionality Preserved**: All existing behavior works identically after refactoring

## Testing Requirements

- Verify message rendering works correctly in both usage locations
- Test empty message array handling
- Confirm context menu actions are properly forwarded
- Ensure proper key props and React rendering optimization

## Dependencies

- Must understand current `Message` interface structure
- Requires knowledge of `MessageItem` component props
- Depends on existing import paths and component locations

## Files Modified

- `packages/shared/src/types/ui/components/ChatContainerDisplayProps.ts`
- `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
- `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`

### Log
