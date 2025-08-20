---
id: T-integrate-defaultstab-with
title: Integrate DefaultsTab with useAgentsStore
status: open
priority: medium
parent: F-defaults-management-feature
prerequisites:
  - T-create-defaults-persistence
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T01:57:01.915Z
updated: 2025-08-20T01:57:01.915Z
---

Connect the existing DefaultsTab component to the useAgentsStore for proper state management and persistence of default settings.

## Context

The DefaultsTab component currently uses local state and hardcoded defaults. It needs to be connected to the useAgentsStore to load, save, and manage defaults through the centralized store.

## Current Implementation Analysis

The DefaultsTab currently:

- Uses local `useState` for settings
- Has hardcoded default values (temperature: 1.0, maxTokens: 1000, topP: 0.95)
- Implements its own reset functionality
- No persistence across app sessions

**Note**: The persistence layer has been implemented with factory defaults of temperature: 0.7, maxTokens: 2000, topP: 0.9 (industry standards). The component should use the store's defaults, setDefaults(), and resetDefaults() methods.

## Implementation Requirements

### Store Integration

Replace local state management with store integration:

```typescript
// Remove local state
// const [settings, setSettings] = useState<AgentDefaults>(defaultSettings);

// Use store instead
const { defaults, setDefaults, resetDefaults, error, isLoading } =
  useAgentsStore();
```

### Loading State

- Show loading spinner while loading defaults from store
- Handle loading errors gracefully
- Use existing loading patterns from other components

### Save Integration

- Remove local debounced announcements (use store's debounced save)
- Update store immediately on control changes
- Let store handle persistence automatically

### Reset Functionality

- Replace local reset with store's resetDefaults action
- Remove local confirmation dialog (if store handles it)
- Or enhance store's reset to include confirmation

### Error Handling

- Display store errors using existing error display patterns
- Handle validation errors from store
- Show user-friendly error messages

## Technical Approach

1. Remove local state management from DefaultsTab
2. Connect to useAgentsStore defaults functionality
3. Update all event handlers to use store actions
4. Add loading and error UI states
5. Test integration with store persistence
6. Ensure accessibility features are maintained

## Component Changes

```typescript
export const DefaultsTab: React.FC = () => {
  const {
    defaults,
    setDefaults,
    resetDefaults,
    error,
    isLoading
  } = useAgentsStore();

  // Remove local state
  // Remove hardcoded defaultSettings
  // Remove local debounced announcements

  const handleTemperatureChange = useCallback(
    (values: number[]) => {
      const newValue = values[0] ?? 0.7; // Use factory default fallback
      setDefaults({ ...defaults, temperature: newValue });
    },
    [defaults, setDefaults],
  );

  // Similar updates for other handlers

  const handleReset = useCallback(async () => {
    // Use store's reset functionality
    await resetDefaults();
  }, [resetDefaults]);
```

## Acceptance Criteria

- ✅ DefaultsTab loads defaults from useAgentsStore
- ✅ All control changes update store immediately
- ✅ Store automatically persists changes with debouncing
- ✅ Reset functionality uses store's resetDefaults
- ✅ Loading state shown while fetching defaults
- ✅ Error states displayed appropriately
- ✅ All accessibility features preserved
- ✅ Preview panel updates correctly with store values
- ✅ Component responds to external defaults changes
- ✅ Unit tests verify store integration works

## Dependencies

- Requires T-create-defaults-persistence (completed) which provides defaults integration into the agents configuration system
- The useAgentsStore already has comprehensive defaults management with getDefaults(), setDefaults(), and resetDefaults() methods
- Store automatically handles persistence through existing agents infrastructure with debounced saving

## Files to Modify

- `apps/desktop/src/components/settings/agents/DefaultsTab.tsx`

## Testing Requirements

- Unit tests for store integration
- Test loading and error states
- Test all control interactions update store
- Test reset functionality
- Test accessibility is maintained
- Test component responds to external store changes

## Accessibility Considerations

- Maintain all existing ARIA labels and screen reader support
- Ensure loading states are announced to screen readers
- Error messages should be accessible
- Preserve keyboard navigation functionality

## Performance Considerations

- Ensure no unnecessary re-renders
- Leverage store's debounced saving
- Minimize component re-rendering on store updates
