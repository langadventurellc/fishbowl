---
kind: task
id: T-refactor
title:
  Refactor AgentLabelsContainerDisplay to accept agents property and generate
  pills internally
status: open
priority: normal
prerequisites: []
created: "2025-07-25T15:17:59.889007"
updated: "2025-07-25T15:17:59.889007"
schema_version: "1.1"
---

## Context

Currently, `AgentLabelsContainerDisplay` receives pre-built agent pills via `agentPills` property and action buttons via `actionButtons` property. This creates tight coupling where the parent component (`MainContentPanelDisplay`) needs to orchestrate the creation of both agent pills and action buttons.

The goal is to make `AgentLabelsContainerDisplay` self-contained by accepting an `agents` array and internally handling the creation of agent pills and the "Add New Agent" button.

## Current Implementation

**AgentLabelsContainerDisplay** currently accepts:

- `agentPills`: Pre-built AgentPill components
- `actionButtons`: Pre-built action buttons (including "Add New Agent")

**MainContentPanelDisplay** currently:

- Creates AgentPill components from agents data
- Creates action buttons including "Add New Agent"
- Passes both to AgentLabelsContainerDisplay

## Implementation Requirements

### 1. Update AgentLabelsContainerDisplayProps Interface

**File**: `packages/shared/src/types/ui/components/AgentLabelsContainerDisplayProps.ts`

**Changes needed:**

- Remove `agentPills` property
- Remove `actionButtons` property
- Add `agents` property (array of Agent objects)
- Add optional `onAddAgent` callback for "Add New Agent" functionality
- Update JSDoc comments to reflect new self-contained behavior

### 2. Update AgentLabelsContainerDisplay Component

**File**: `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

**Changes needed:**

- Import `Agent` type and `AgentPill` component
- Import `Button` component for "Add New Agent" button
- Update component props to accept `agents` and `onAddAgent`
- Add internal logic to map agents to AgentPill components
- Add internal "Add New Agent" button with proper styling and callback
- Maintain existing layout and styling
- Update component documentation comments

**Expected component structure:**

```tsx
// Agent pills generated from agents prop
{
  agents.map((agent, index) => <AgentPill key={index} agent={agent} />);
}

// Built-in "Add New Agent" button
<Button
  variant="secondary"
  size="small"
  onClick={onAddAgent}
  aria-label="Add new agent"
>
  Add Agent
</Button>;
```

### 3. Update MainContentPanelDisplay Component

**File**: `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

**Changes needed:**

- Remove agent pill creation logic
- Remove action button creation logic
- Pass `agents` prop directly to AgentLabelsContainerDisplay
- Add `onAddAgent` callback handler (can be demo implementation: `() => console.log("Demo: Add agent")`)
- Update imports to remove unused AgentPill and Button imports
- Simplify component logic by removing manual composition

### 4. Rebuild Shared Package

**After updating props interface:**

- Run `pnpm build:libs` to rebuild shared package
- Ensure all apps can import updated types from `@fishbowl-ai/shared`

## Technical Approach

1. **Types First**: Update shared types for new props structure
2. **Component Logic**: Add internal agent pill generation and button creation in AgentLabelsContainerDisplay
3. **Integration**: Update MainContentPanelDisplay to use new prop interface
4. **Build**: Rebuild shared packages for type propagation
5. **Verification**: Ensure visual parity and functionality

## Acceptance Criteria

- [ ] `AgentLabelsContainerDisplay` accepts `agents` prop instead of `agentPills`
- [ ] Component internally creates AgentPill components from agents data
- [ ] Component includes built-in "Add New Agent" button with proper styling
- [ ] `onAddAgent` callback prop works for "Add New Agent" functionality
- [ ] `actionButtons` and `agentPilles` props completely removed from interface
- [ ] `MainContentPanelDisplay` simplified by removing manual composition of agent pills and buttons
- [ ] All TypeScript types compile without errors after `pnpm build:libs`
- [ ] Visual appearance and layout remain identical to current implementation
- [ ] Component maintains proper responsive behavior and theming
- [ ] "Add New Agent" button click triggers callback with proper event handling

## Dependencies

- Requires access to `AgentPill` component for internal rendering
- Must maintain compatibility with existing `Agent` type from shared package
- Depends on shared type definitions in `@fishbowl-ai/shared` package

## Testing Requirements

- [ ] Verify component maintains proper accessibility attributes
- No automated tests.

## Security Considerations

- Validate agents prop is array before mapping
- Ensure onAddAgent callback is properly typed and validated
- Sanitize agent data when rendering AgentPill components

## Files Modified

Expected files to be modified:

- `packages/shared/src/types/ui/components/AgentLabelsContainerDisplayProps.ts`
- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

### Log
