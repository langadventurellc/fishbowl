---
kind: task
id: T-integrate-modal-shell-components
title: Integrate modal shell components and implement complete settings modal structure
status: open
priority: normal
prerequisites:
  - T-create-modal-header-component
  - T-create-modal-footer-component
  - T-enhance-two-panel-layout
created: "2025-07-26T20:50:53.433851"
updated: "2025-07-26T20:50:53.433851"
schema_version: "1.1"
parent: F-modal-shell-structure-and-layout
---

# Modal Shell Integration

## Context

Integrate the newly created ModalHeader and ModalFooter components with the enhanced two-panel layout to create the complete settings modal shell structure as specified in the UI requirements.

## Implementation Requirements

### Component Integration Structure

Update `SettingsModal.tsx` to use the complete shell structure:

```tsx
<Dialog open={isOpen} onOpenChange={closeModal}>
  <DialogContent className="settings-modal-content">
    <ModalHeader title="Settings" onClose={closeModal} />

    <div className="modal-body-layout">
      <NavigationPanel
        activeSection={activeSection}
        activeSubTab={activeSubTab}
        onSectionChange={setActiveSection}
        onSubTabChange={setActiveSubTab}
      />

      <ContentArea>
        <div className="content-placeholder">
          Content for {activeSection} section
        </div>
      </ContentArea>
    </div>

    <ModalFooter
      onCancel={closeModal}
      onSave={handleSave}
      saveDisabled={!hasUnsavedChanges}
    />
  </DialogContent>
</Dialog>
```

### Layout Structure Requirements

- **Header**: Fixed at top, 50px height
- **Body**: Flexible middle section with two-panel layout
- **Footer**: Fixed at bottom, 60px height
- **Panel Layout**: Navigation (fixed width) + Content (flexible width)

### Modal Shell CSS Structure

```tsx
// Modal content container
height: 100% (full modal height)
display: flex
flex-direction: column

// Header: fixed height at top
flex: none
height: 50px

// Body: flexible middle section
flex: 1
display: flex (for two-panel layout)
overflow: hidden

// Footer: fixed height at bottom
flex: none
height: 60px
```

### Responsive Behavior Integration

Ensure all components work together across breakpoints:

- **Large screens**: Header + Two-panel body + Footer
- **Medium screens**: Adjusted panel widths, maintained structure
- **Small screens**: Header + Collapsible navigation + Footer

### State Management Integration

- Pass through all necessary state props to child components
- Ensure proper Zustand store integration across all components
- Maintain consistent state flow between header, navigation, content, and footer

### Accessibility Integration

- Proper ARIA structure for complete modal
- Keyboard navigation flow: Header → Navigation → Content → Footer
- Screen reader announcements for modal structure
- Focus management across all shell components

### Props and Interfaces

Update or create interfaces for:

```tsx
interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: SettingsSection;
  activeSubTab?: string;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}
```

### Acceptance Criteria

- [ ] ModalHeader integrates properly at top with 50px height
- [ ] Two-panel layout works correctly in middle section
- [ ] ModalFooter integrates properly at bottom with 60px height
- [ ] Navigation panel maintains proper width across all breakpoints
- [ ] Content area adjusts properly with navigation panel changes
- [ ] All Zustand store integrations work correctly
- [ ] Keyboard navigation flows properly across all components
- [ ] Responsive behavior works at all breakpoints
- [ ] Modal maintains proper dimensions and proportions
- [ ] All accessibility features function correctly

## Technical Approach

### 1. Update Main Modal Component

- Import new ModalHeader and ModalFooter components
- Update layout structure to use three-section design
- Implement proper CSS flex layout for shell structure

### 2. Component Integration

- Ensure proper prop passing to all child components
- Implement error boundaries for component safety
- Add proper TypeScript interfaces for all integrations

### 3. Layout Implementation

- Use CSS flexbox for main shell structure (header/body/footer)
- Maintain existing two-panel layout within body section
- Ensure proper responsive behavior across all sections

### 4. State Flow Implementation

- Centralize state management through main modal component
- Pass state and actions to all child components as needed
- Implement proper state synchronization across components

## Files to Modify

1. `apps/desktop/src/components/settings/SettingsModal.tsx`
   - Import ModalHeader and ModalFooter components
   - Update layout structure
   - Implement complete shell integration

2. Component import updates:
   - Add imports for new ModalHeader and ModalFooter
   - Update existing navigation and content imports
   - Ensure proper component registration

## Dependencies

- **Prerequisite**: ModalHeader component must be completed
- **Prerequisite**: ModalFooter component must be completed
- **Prerequisite**: Two-panel layout enhancement must be completed
- Must work with existing Zustand store
- Must maintain compatibility with existing content components

## Testing Requirements

- Integration tests for complete modal shell structure
- Layout tests at all responsive breakpoints
- State flow tests across all components
- Accessibility tests for complete modal experience
- Visual regression tests for shell appearance
- Performance tests for modal rendering and interactions

## Performance Considerations

- Efficient component rendering and re-rendering
- Proper memoization for child components
- Optimized layout calculations
- Smooth transitions and interactions across all components

## Future Enhancements

- Error boundary implementation for robust component handling
- Loading states for modal content sections
- Animation improvements for modal transitions

### Log
