---
id: T-update-prop-drilling-chain-to
title: Update prop drilling chain to pass selectedConversationId through components
status: open
priority: medium
parent: F-add-agent-modal-component
prerequisites:
  - T-update-agentlabelscontainerdis
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T17:45:12.148Z
updated: 2025-08-25T17:45:12.148Z
---

# Update Prop Drilling Chain for selectedConversationId

## Context

Update the component hierarchy to pass selectedConversationId from Home.tsx through the prop drilling chain to AgentLabelsContainerDisplay, enabling conversation-specific agent management functionality.

## Related Work

- Feature: F-add-agent-modal-component
- Epic: E-add-agents-to-conversations
- Prerequisites: T-update-agentlabelscontainerdis (props interface update)
- Architecture Reference: Epic description outlines prop drilling pattern

## Component Chain

The prop must flow through this hierarchy:

```
Home.tsx (manages selectedConversationId state)
  └── ConversationLayoutDisplay (receives as prop)
      └── MainContentPanelDisplay (receives as prop)
          └── AgentLabelsContainerDisplay (receives selectedConversationId)
```

## Implementation Requirements

### 1. Update Home.tsx Component

**File**: `apps/desktop/src/components/layout/Home.tsx`

**Changes Required**:

- Pass selectedConversationId to ConversationLayoutDisplay
- Ensure state management for selectedConversationId exists
- Update props interface if needed

**Expected Pattern**:

```typescript
<ConversationLayoutDisplay
  selectedConversationId={selectedConversationId}
  // other existing props
/>
```

### 2. Update ConversationLayoutDisplay Component

**File**: `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`

**Changes Required**:

- Accept selectedConversationId prop in interface
- Pass selectedConversationId to MainContentPanelDisplay
- Update component props type

**Props Interface Update**:

```typescript
interface ConversationLayoutDisplayProps {
  selectedConversationId: string | null; // NEW
  // existing props...
}
```

### 3. Update MainContentPanelDisplay Component

**File**: `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

**Changes Required**:

- Accept selectedConversationId prop in interface
- Pass selectedConversationId to AgentLabelsContainerDisplay
- Update component props type

**Props Update**:

```typescript
<AgentLabelsContainerDisplay
  selectedConversationId={selectedConversationId} // NEW
  // existing props...
/>
```

### 4. Create/Update Props Interfaces

**Files to Update**:

- Create or update props interfaces for each component in the chain
- Add selectedConversationId property to intermediate component props
- Maintain type safety throughout the prop chain

**Type Structure**:

```typescript
// For each component in chain
interface ComponentProps {
  selectedConversationId: string | null;
  // existing props...
}
```

### 5. Handle Edge Cases

**Null Conversation Handling**:

- All components must handle selectedConversationId being null
- Components should gracefully degrade when no conversation selected
- No breaking changes to existing functionality

**Type Safety**:

- Ensure proper null checking throughout chain
- Maintain TypeScript strict mode compliance
- Proper optional property handling

## Technical Approach

### 1. Component Interface Updates

- Add selectedConversationId to each component's props interface
- Make property optional where appropriate for backward compatibility
- Follow existing prop naming conventions

### 2. Prop Passing Pattern

- Pass selectedConversationId explicitly through each component
- Maintain existing prop structure and naming
- Use consistent prop drilling pattern from existing code

### 3. Testing Strategy

- Update existing component tests to handle new prop
- Test prop passing through entire chain
- Verify null handling at each level

## Acceptance Criteria

### Prop Passing Requirements

- ✅ selectedConversationId flows from Home.tsx through entire component chain
- ✅ Each component accepts and passes the prop correctly
- ✅ AgentLabelsContainerDisplay receives selectedConversationId properly
- ✅ Type safety maintained throughout prop chain
- ✅ No TypeScript compilation errors

### Component Interface Requirements

- ✅ All intermediate component props interfaces updated
- ✅ selectedConversationId typed as string | null consistently
- ✅ Props interfaces follow existing patterns
- ✅ Backward compatibility maintained for existing usage

### Integration Requirements

- ✅ AgentLabelsContainerDisplay can access selectedConversationId
- ✅ useConversationAgents hook receives correct conversation ID
- ✅ Add Agent button state responds to conversation selection
- ✅ Modal functionality works with conversation context

### State Management Requirements

- ✅ selectedConversationId state managed at appropriate level (Home.tsx)
- ✅ State changes propagate through component chain
- ✅ No unnecessary re-renders triggered by prop changes
- ✅ Proper dependency management in components

### Edge Case Requirements

- ✅ Null selectedConversationId handled gracefully
- ✅ Component chain works when no conversation selected
- ✅ No runtime errors with undefined/null values
- ✅ Graceful degradation of Add Agent functionality

### Testing Requirements

- ✅ Unit tests updated for components with new props
- ✅ Integration tests verify prop passing through chain
- ✅ Tests cover null conversation scenarios
- ✅ TypeScript compilation tests pass
- ✅ Backward compatibility tests for existing usage

## Dependencies

- AgentLabelsContainerDisplayProps update (T-update-agentlabelscontainerdis)
- useConversationAgents hook (already implemented)
- Existing Home.tsx conversation state management

## Files to Modify

- `apps/desktop/src/components/layout/Home.tsx`
- `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`
- Related props interface files (create if needed)
- Component test files (update for new props)

## Implementation Notes

### 1. Search for Existing State Management

- Verify selectedConversationId state exists in Home.tsx
- Check current conversation selection patterns
- Ensure consistent state variable naming

### 2. Props Interface Locations

- Check if intermediate component props interfaces exist
- Create in appropriate locations following project structure
- Use ui-shared package for shared interfaces where appropriate

### 3. Testing Updates

- Update existing component tests for new props
- Add tests for prop passing behavior
- Ensure all components handle null conversation gracefully

## Quality Checks

- Run `pnpm type-check` for TypeScript validation
- Run `pnpm test` for unit test validation
- Run `pnpm quality` for linting and formatting
- Manual testing: conversation selection triggers agent updates
