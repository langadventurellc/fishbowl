---
id: T-integrate-context-statistics
title: Integrate context statistics into ChatContainerDisplay
status: done
priority: medium
parent: F-message-context-control
prerequisites:
  - T-add-context-statistics
affectedFiles:
  apps/desktop/src/components/layout/ChatContainerDisplay.tsx:
    Integrated ContextStatistics component above message list with conditional
    rendering, compact variant styling, and proper layout structure. Added
    import for ContextStatistics component. Modified return structure to include
    statistics header area with border separator and maintained scrollable
    message area functionality.
  apps/desktop/src/components/layout/__tests__/ChatContainerDisplay.test.tsx:
    "Added comprehensive unit test suite for ContextStatistics integration
    including 8 new test cases covering: component rendering with messages,
    conditional rendering for empty states, message inclusion count updates,
    proper props passing, DOM positioning, and styling verification. Updated
    existing tests to accommodate new component structure changes. Added
    ContextStatistics mock for isolated testing. All 24 tests passing
    successfully."
log:
  - >-
    Successfully integrated ContextStatistics component into
    ChatContainerDisplay to provide real-time feedback about message inclusion
    in conversation context. The implementation positions the statistics above
    the message list in a fixed header area that remains always visible while
    scrolling. The integration includes comprehensive unit tests covering all
    functionality and maintains backward compatibility with existing
    ChatContainerDisplay behavior.


    Key implementation details:

    - Added ContextStatistics import and integration above scrollable message
    area

    - Used compact variant to maintain space efficiency in chat layout

    - Added conditional rendering to only show statistics when messages exist

    - Applied consistent styling with existing chat components using border
    separator

    - Updated component structure with proper wrapper div for layout
    organization

    - Maintained all existing functionality including scroll behavior and
    styling props


    All acceptance criteria met:

    - Statistics display accurate message inclusion count with immediate updates

    - Visual integration matches chat design with non-intrusive placement

    - Real-time updates when message inclusion changes via checkbox interactions

    - Proper empty state handling when no messages exist

    - Comprehensive test coverage including edge cases and accessibility
schema: v1.0
childrenIds: []
created: 2025-08-30T06:20:36.534Z
updated: 2025-08-30T06:20:36.534Z
---

# Integrate context statistics into ChatContainerDisplay

## Context

The ContextStatistics component needs to be integrated into the ChatContainerDisplay to provide users with real-time feedback about message inclusion. The statistics should appear prominently but non-intrusively in the chat interface.

## Technical Implementation

**Files to modify:**

- `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`
- `apps/desktop/src/components/layout/__tests__/ChatContainerDisplay.test.tsx`
- `packages/ui-shared/src/types/chat/ChatContainerDisplayProps.ts` (if needed)

### Step 1: Import and integrate ContextStatistics component

- Add ContextStatistics import to ChatContainerDisplay
- Position the statistics component in an appropriate location (likely above or below message list)
- Pass the messages array to calculate statistics

### Step 2: Determine optimal placement

- Position statistics where they're visible but don't interfere with message flow
- Consider placement above message list, below input, or in a dedicated area
- Ensure statistics update immediately when message inclusion changes

### Step 3: Handle edge cases and responsive design

- Show appropriate content when no messages exist
- Handle loading states gracefully
- Ensure component works across different screen sizes

## Detailed Acceptance Criteria

### Statistics Integration

- **GIVEN** ChatContainerDisplay with messages
- **WHEN** component renders
- **THEN** ContextStatistics should be visible and show accurate count
- **AND** statistics should update when message inclusion changes

### Visual Integration

- **GIVEN** context statistics in chat interface
- **WHEN** users interact with the chat
- **THEN** statistics should be prominent enough to notice but not intrusive
- **AND** styling should match the overall chat design

### Real-time Updates

- **GIVEN** user toggles message inclusion
- **WHEN** message inclusion state changes
- **THEN** context statistics should update immediately
- **AND** no manual refresh should be required

### Empty States

- **GIVEN** conversation with no messages
- **WHEN** ChatContainerDisplay renders
- **THEN** context statistics should handle empty state gracefully
- **AND** show appropriate message or hide statistics

## Testing Requirements

Include unit tests for:

- ContextStatistics integration and rendering
- Statistics updates when message inclusion changes
- Empty message array handling
- Component positioning and styling
- Props passing to ContextStatistics component

## Implementation Notes

- Place statistics in a logical location that users will naturally notice
- Ensure the integration doesn't break existing ChatContainerDisplay functionality
- Use existing spacing and styling patterns from the chat components
- Consider adding subtle animations for count changes

## UI Placement Options

Consider these placement options:

1. **Above message list**: Fixed header showing context info
2. **Below message list, above input**: Summary area before composing
3. **Floating indicator**: Subtle overlay that doesn't take space

Choose the option that best fits the existing UI flow and user experience.

## Out of Scope

- Do not modify the ContextStatistics component implementation
- Do not add new props to ChatContainerDisplayProps unless absolutely necessary
- Do not implement context size/token estimation
- Do not add bulk operation controls in this integration
