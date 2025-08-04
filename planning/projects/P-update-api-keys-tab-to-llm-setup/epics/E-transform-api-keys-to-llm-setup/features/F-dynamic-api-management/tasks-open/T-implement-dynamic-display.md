---
kind: task
id: T-implement-dynamic-display
title: Implement dynamic display between empty state and card list
status: open
priority: normal
prerequisites:
  - T-implement-local-state-management
  - T-update-llmprovidercard-component
created: "2025-08-04T13:38:08.759067"
updated: "2025-08-04T13:38:08.759067"
schema_version: "1.1"
parent: F-dynamic-api-management
---

## Context

The LlmSetupSection needs to dynamically switch between showing the empty state (when no APIs are configured) and showing the list of configured API cards. This provides a smooth user experience as users add and remove configurations.

## Implementation Requirements

- Conditionally render EmptyLlmState when configuration array is empty
- Render list of LlmProviderCards when configurations exist
- Ensure smooth transitions between states
- Handle edge cases like rapid add/delete operations
- Maintain proper spacing between cards in the list

## Technical Approach

1. In LlmSetupSection component's render method:

   ```typescript
   {configuredApis.length === 0 ? (
     <EmptyLlmState
       selectedProvider={selectedProvider}
       onProviderChange={handleProviderChange}
       onSetupClick={handleSetupClick}
     />
   ) : (
     <div className="space-y-4">
       {configuredApis.map((api) => (
         <LlmProviderCard
           key={api.id}
           api={api}
           onEdit={() => handleEdit(api)}
           onDelete={() => handleDeleteClick(api.id)}
         />
       ))}
     </div>
   )}
   ```

2. Ensure proper styling:
   - Use `space-y-4` for vertical spacing between cards
   - Cards should stack vertically with consistent gaps
   - No additional wrapper needed for cards

3. Handle state transitions:
   - Empty → Cards: When first API is added
   - Cards → Empty: When last API is deleted
   - Smooth re-renders during add/edit/delete

## Layout Requirements

- Empty state: Centered layout as already implemented
- Card list: Full-width cards with vertical spacing
- No horizontal scrolling
- Responsive behavior maintained

## Acceptance Criteria

- ✓ Empty state shows when configuredApis.length === 0
- ✓ Card list shows when configuredApis.length > 0
- ✓ Cards properly keyed with unique IDs
- ✓ Vertical spacing of 1rem (space-y-4) between cards
- ✓ Smooth transitions during state changes
- ✓ No layout shift when switching states
- ✓ Proper event handlers connected for edit/delete

## Dependencies

- Requires T-implement-local-state-management for state array
- Requires T-update-llmprovidercard-component for card display

## File Location

- Update: `apps/desktop/src/components/settings/LlmSetupSection.tsx`

## Edge Cases to Handle

- Rapid add/delete causing re-renders
- Multiple cards with long names
- Scrolling behavior with many cards

### Log
