---
id: F-implement-settingsformmodal
title: Implement SettingsFormModal Component
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/common/SettingsFormModal.tsx:
    Created new SettingsFormModal base component with complete props interface,
    shadcn/ui Dialog integration, accessibility features, and data-form-modal
    attribute for nested detection; Added useEffect import, implemented
    useKeyboardHandling custom hook with capture-phase event listeners for
    Escape and Ctrl/Cmd+S handling, integrated hook with SettingsFormModal
    component, added onRequestSave prop handling; Added focus trap integration
    with useFocusTrap hook including configurable initialFocusSelector prop
    support; implemented screen reader announcements using
    announceToScreenReader utility with announceOnOpen prop; added proper ARIA
    attributes including aria-labelledby and aria-describedby for modal
    accessibility; containerRef from focus trap attached to DialogContent for
    focus management
  apps/desktop/src/components/settings/common/index.ts:
    Created barrel export file
    with SettingsFormModal export and prepared structure for future common
    components
  apps/desktop/src/components/settings/SettingsModal.tsx: Updated nested dialog
    detection logic to use [data-form-modal] selector instead of
    .agent-form-modal CSS class, and updated MutationObserver attributeFilter to
    watch for data-form-modal changes instead of class changes
log: []
schema: v1.0
childrenIds:
  - T-implement-focus-management
  - T-implement-unsaved-changes
  - T-migrate-agentformmodal-to-use
  - T-migrate-llmconfigmodal-to-use
  - T-migrate-personalityformmodal
  - T-migrate-roleformmodal-to-use
  - T-create-barrel-export-and
  - T-create-settingsformmodal-base
  - T-implement-keyboard-event
created: 2025-08-31T04:46:07.303Z
updated: 2025-08-31T04:46:07.303Z
---

# Implement SettingsFormModal Component

## Purpose and Functionality

Create a reusable `SettingsFormModal` wrapper component that consolidates common modal behavior across all four settings form modals (Agent, Role, Personality, and LLM Config). This component will solve the current escape key handling issues and eliminate code duplication while maintaining clean separation between modal infrastructure and form-specific logic.

## Key Components to Implement

### 1. SettingsFormModal Component

- **Location**: `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- **Props Interface**: `SettingsFormModalProps` (local to desktop app)
- Minimal API focused on coordination rather than form management

### 2. Updated SettingsModal Nested Detection

- Replace CSS class-based detection with `[data-form-modal]` selector
- Makes the system portable and decoupled from specific CSS classes

## Detailed Acceptance Criteria

### Functional Requirements

#### Modal Infrastructure

- ✅ **Dialog Wrapper**: Renders using shadcn/ui Dialog components with proper ARIA attributes
- ✅ **Header Rendering**: Displays configurable title and optional description
- ✅ **Content Area**: Renders children prop for form-specific content
- ✅ **Data Attributes**: Sets `data-form-modal="true"` for nested dialog detection

#### Keyboard Handling

- ✅ **High-Priority Escape**: Uses capture-phase document listener to override SettingsModal's handler
- ✅ **Ctrl/Cmd+S Shortcuts**: Delegates save requests to child forms via `onRequestSave` callback
- ✅ **Event Prevention**: Calls `preventDefault()` and `stopPropagation()` appropriately
- ✅ **Conditional Activation**: Only active when `isOpen` is true

#### Focus Management

- ✅ **Focus Trap**: Integrates `useFocusTrap` with configurable initial focus selector
- ✅ **Restore Focus**: Returns focus to trigger element on modal close
- ✅ **Accessibility**: Proper focus indicators and keyboard navigation

#### Unsaved Changes Handling

- ✅ **Conditional Confirmation**: Shows confirmation dialog when `confirmOnClose.enabled` is true
- ✅ **Custom Messages**: Supports configurable confirmation dialog text
- ✅ **Discard Callback**: Calls `onDiscard` before closing to reset form state
- ✅ **No Confirmation**: Allows immediate close when no unsaved changes

#### Accessibility Features

- ✅ **Screen Reader Announcements**: Optional `announceOnOpen` message
- ✅ **ARIA Attributes**: Proper modal labeling and descriptions
- ✅ **No Double Announcements**: Avoids conflicts with child form announcements

### Technical Requirements

#### Props Interface Design

```typescript
interface SettingsFormModalProps {
  // Required
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;

  // Optional
  description?: string;
  className?: string;
  initialFocusSelector?: string;
  announceOnOpen?: string;
  dataTestId?: string;

  // Save integration
  onRequestSave?: () => void;

  // Unsaved changes
  confirmOnClose?: {
    enabled: boolean;
    message: {
      title: string;
      body: string;
      confirmText?: string;
      cancelText?: string;
    };
    onDiscard?: () => void;
  };
}
```

#### Implementation Constraints

- ✅ **No Form Management**: Does not handle form state, validation, or data
- ✅ **No Error/Loading UI**: Child forms manage their own error and loading states
- ✅ **No Size Presets**: Uses className pass-through for sizing (YAGNI principle)
- ✅ **Default Modal Behavior**: Uses standard Radix modal behavior (not `modal={false}`)

#### Integration Points

- ✅ **SettingsModal Detection**: Updates nested dialog detection to use `[data-form-modal]`
- ✅ **Confirmation Dialog**: Uses existing `useConfirmationDialog` hook pattern
- ✅ **Accessibility Utils**: Integrates with existing `announceToScreenReader` utility

### Security Considerations

- ✅ **Event Handling**: Prevents event propagation to avoid unintended side effects
- ✅ **Focus Management**: Ensures focus cannot escape modal boundaries
- ✅ **State Validation**: Validates props to prevent invalid modal states

### Performance Requirements

- ✅ **Event Listener Lifecycle**: Adds/removes listeners only when modal is open
- ✅ **Re-render Optimization**: Uses proper dependency arrays in hooks
- ✅ **Memory Management**: Cleans up observers and listeners on unmount

### Browser Compatibility

- ✅ **Keyboard Events**: Works across all supported browsers (Chrome, Firefox, Safari, Edge)
- ✅ **Focus Management**: Compatible with browser focus management APIs
- ✅ **Event Capture**: Uses standard capture-phase event handling

## Implementation Guidance

### Technical Approach

1. **Create Base Component**: Start with minimal viable implementation
2. **Centralized Event Handling**: Use single capture-phase listener for all keyboard shortcuts
3. **Delegation Pattern**: Child forms provide callbacks rather than wrapper managing form logic
4. **Composition Over Configuration**: Use children prop and callbacks rather than complex configuration

### Key Patterns to Follow

- **Hook Integration**: Leverage existing hooks (`useFocusTrap`, `useConfirmationDialog`)
- **Event Capture**: Use `addEventListener(event, handler, true)` for priority handling
- **Conditional Rendering**: Only render confirmation dialog when needed
- **Props Validation**: Use TypeScript interfaces for compile-time validation

### Migration Strategy

1. **Build SettingsFormModal**: Create component and update SettingsModal detection
2. **Migrate RoleFormModal**: Clean form separation, uses `formRef.resetToInitialData()`
3. **Migrate AgentFormModal**: Exercise unsaved changes confirmation
4. **Migrate PersonalityFormModal**: Test focus and keyboard handling
5. **Migrate LlmConfigModal**: Wire `onRequestSave={() => form.handleSubmit(handleSave)()}`

## Testing Requirements

### Unit Testing

- ✅ **Keyboard Events**: Test Escape and Ctrl/Cmd+S handling with capture priority
- ✅ **Focus Management**: Verify focus trap activation and restoration
- ✅ **Confirmation Flow**: Test unsaved changes confirmation dialog
- ✅ **Props Handling**: Verify all optional props work correctly

### Integration Testing

- ✅ **Nested Detection**: Verify SettingsModal properly detects form modals
- ✅ **Event Priority**: Confirm form modal handlers run before SettingsModal
- ✅ **Accessibility**: Test screen reader announcements and ARIA attributes

### Manual Testing

- ✅ **Escape Key**: Pressing Escape closes only the form modal, not settings
- ✅ **Save Shortcuts**: Ctrl/Cmd+S triggers form submission in each modal
- ✅ **Unsaved Changes**: Confirmation dialog appears when expected
- ✅ **Focus Flow**: Tab navigation works correctly within modal

## Dependencies

- None (standalone feature)

## Files to Create/Modify

- **New**: `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- **New**: `apps/desktop/src/components/settings/common/index.ts` (barrel export)
- **Update**: `apps/desktop/src/components/settings/SettingsModal.tsx` (nested detection)

## Success Criteria

1. **Escape Key Fixed**: All form modals properly handle Escape key without closing settings
2. **Code Reduction**: Eliminate ~200 lines of duplicate code per modal
3. **Consistent Behavior**: All form modals have identical keyboard and accessibility behavior
4. **Maintainability**: Single location for common modal concerns
5. **Type Safety**: Full TypeScript coverage with proper interfaces

## Risk Mitigation

- **Over-Engineering Prevention**: Start minimal, add features only when needed (YAGNI)
- **Breaking Changes**: Use `[data-form-modal]` to decouple from CSS class names
- **Testing Coverage**: Comprehensive tests for keyboard and focus edge cases
- **Migration Safety**: Migrate one modal at a time to validate approach
