---
kind: feature
id: F-modal-shell-structure-and-layout
title: Modal Shell Structure and Layout
status: in-progress
priority: high
prerequisites:
  - F-core-modal-dialog-implementation
  - F-settings-modal-state-management
created: "2025-07-26T01:11:38.710320"
updated: "2025-07-26T01:11:38.710320"
schema_version: "1.1"
parent: E-modal-foundation-infrastructure
---

# Modal Shell Structure and Layout

## Purpose and Functionality

Implement the complete modal shell structure including header with title and close button, two-panel content area with navigation and main content, and footer with Cancel/Save buttons. This feature creates the foundational layout that all settings sections will use, providing consistent navigation and interaction patterns.

## Settings Modal UI Specification

**IMPORTANT: Before beginning work on this feature, you MUST read and reference `docs/specifications/settings-modal-ui-spec.md`.** This document contains detailed design and functional requirements for the settings modal, including exact dimensions, layout specifications, navigation structure, content sections, and user experience considerations. All implementation work should follow the specifications outlined in this document. If you have questions about requirements, consult this specification first as it likely contains the answer.

## Key Components to Implement

### Modal Header Implementation

- Create header component with specified dimensions and styling (50px height)
- Implement "Settings" title with proper typography (18px font, left-aligned, 20px padding)
- Add functional close button (×) with proper styling and hover states (40x40px hover area)
- Integrate header with Zustand state for proper modal closing

### Two-Panel Content Layout

- Implement left navigation panel (200px fixed width, collapsible on narrow screens)
- Create main content area with proper spacing and scroll behavior
- Add visual separation between panels (1px solid border)
- Implement responsive behavior for different screen sizes

### Navigation Panel Structure

- Create navigation item list with proper styling and interactive states
- Implement navigation items with hover, active, and default states
- Add support for sub-navigation tabs within main sections
- Integrate with Zustand state for section/tab selection

### Modal Footer Implementation

- Create footer component with specified dimensions (60px height, 1px top border)
- Add Cancel and Save buttons with proper styling and spacing
- Implement button states (enabled/disabled) and interactions
- Integrate footer with modal state management

## Detailed Acceptance Criteria

### Header Component

- [ ] Header height exactly 50px with proper background styling
- [ ] "Settings" title displays with 18px font, left-aligned with 20px padding
- [ ] Close button (×) positioned right-aligned with 40x40px hover area
- [ ] Close button triggers modal close action through Zustand store
- [ ] Header background slightly darker than content area for visual hierarchy
- [ ] Proper typography and color contrast for accessibility

### Navigation Panel Layout

- [ ] Left panel fixed width of 200px on desktop screens
- [ ] Panel background slightly different from content area for visual separation
- [ ] Right border: 1px solid border color for panel separation
- [ ] Panel padding: 10px for proper content spacing
- [ ] Scrollable when navigation items exceed panel height

### Navigation Items Implementation

- [ ] Each navigation item height: 40px with proper vertical centering
- [ ] Item padding: 12px horizontal with centered vertical alignment
- [ ] Border radius: 4px for each navigation item
- [ ] Interactive states: Default (no background), Hover (light background tint), Active (darker background with 3px left accent border)
- [ ] Navigation items integrate with Zustand store for state management

### Navigation Structure Support

- [ ] Main sections: General, API Keys, Appearance, Agents, Personalities, Roles, Advanced
- [ ] Sub-navigation support for sections with multiple tabs (Agents, Personalities, Roles)
- [ ] Active section highlighting with proper visual feedback
- [ ] Sub-tab rendering and selection within applicable sections

### Content Area Layout

- [ ] Main content area takes remaining width after navigation panel
- [ ] Content padding: 30px for proper spacing
- [ ] Vertical scroll when content exceeds modal height
- [ ] Maximum content width: 600px (centered if panel is wider)
- [ ] Proper content area background and styling

### Footer Implementation

- [ ] Footer height exactly 60px with proper background
- [ ] Border-top: 1px solid border color for visual separation
- [ ] Buttons right-aligned with 20px padding from modal edge
- [ ] Cancel button: Secondary style, closes modal without saving
- [ ] Save button: Primary style, disabled state when no changes
- [ ] Button spacing: 10px between Cancel and Save buttons

### Responsive Behavior

- [ ] Screens < 1000px: Modal 95% width, navigation panel 180px
- [ ] Screens < 800px: Navigation becomes collapsible hamburger menu
- [ ] Screens < 800px: Full width content area when navigation hidden
- [ ] Content area padding reduces to 20px on narrow screens
- [ ] Navigation toggle functionality on narrow screens

## Implementation Guidance

### Technical Approach

- Build on Core Modal Dialog component as foundation
- Use CSS Grid or Flexbox for two-panel layout structure
- Implement responsive design with Tailwind CSS breakpoints
- Create reusable navigation components for consistent styling
- Integrate with Zustand store for all state management

### Component Structure

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
        {/* Content sections will be implemented in future features */}
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

### Navigation Panel Structure

```tsx
<NavigationPanel>
  <NavigationItem
    id="general"
    label="General"
    active={activeSection === "general"}
    onClick={() => setActiveSection("general")}
  />
  <NavigationItem
    id="api-keys"
    label="API Keys"
    active={activeSection === "api-keys"}
    onClick={() => setActiveSection("api-keys")}
  />
  {/* Sections with sub-tabs */}
  <NavigationItem
    id="agents"
    label="Agents"
    active={activeSection === "agents"}
    onClick={() => setActiveSection("agents")}
    hasSubTabs={true}
  >
    <SubNavigationTabs visible={activeSection === "agents"}>
      <SubTab id="library" label="Library" />
      <SubTab id="templates" label="Templates" />
      <SubTab id="defaults" label="Defaults" />
    </SubNavigationTabs>
  </NavigationItem>
</NavigationPanel>
```

### File Organization

- Create `apps/desktop/src/components/settings/ModalShell.tsx` for main shell
- Create `apps/desktop/src/components/settings/ModalHeader.tsx` for header
- Create `apps/desktop/src/components/settings/NavigationPanel.tsx` for navigation
- Create `apps/desktop/src/components/settings/ModalFooter.tsx` for footer
- Add shared types in `apps/desktop/src/types/settings.ts`

## Testing Requirements

### Layout and Styling Testing

- [ ] Modal shell renders with correct dimensions and proportions
- [ ] Header displays title and close button with proper styling
- [ ] Navigation panel shows all sections with correct styling
- [ ] Footer displays buttons with proper alignment and spacing
- [ ] Two-panel layout maintains correct proportions on different screen sizes

### Navigation Functionality Testing

- [ ] Clicking navigation items updates active section state
- [ ] Sub-tabs appear and function correctly for applicable sections
- [ ] Active section highlighting works correctly
- [ ] Navigation integrates properly with Zustand store
- [ ] Navigation state persists during modal session

### Responsive Design Testing

- [ ] Layout adapts correctly on screens < 1000px
- [ ] Navigation becomes collapsible on screens < 800px
- [ ] Content area adjusts properly when navigation is collapsed
- [ ] Touch interactions work correctly on mobile-like screen sizes
- [ ] Layout remains functional and visually appealing at all breakpoints

### Interaction Testing

- [ ] Close button closes modal and resets state
- [ ] Cancel button closes modal without triggering save actions
- [ ] Save button shows disabled state when no changes present
- [ ] All interactive elements have proper hover and focus states
- [ ] Keyboard navigation works correctly within shell components

## Security Considerations

### Navigation Security

- Validate navigation section/tab IDs to prevent unauthorized access
- Ensure navigation state changes don't bypass security checks
- Implement proper sanitization of navigation labels and content
- Prevent XSS through navigation item rendering

### State Security

- Ensure modal state changes don't expose sensitive data
- Validate state updates to prevent malicious state manipulation
- Implement proper cleanup when modal closes to prevent data leaks
- Secure integration with Zustand store against unauthorized access

## Performance Requirements

### Rendering Performance

- Modal shell renders completely within 100ms of state change
- Navigation item highlighting updates within 16ms (60fps)
- Smooth scrolling in navigation panel and content area
- Efficient re-rendering when active section changes

### Layout Performance

- No layout thrashing during responsive breakpoint changes
- Smooth transitions when navigation panel collapses/expands
- Efficient CSS Grid/Flexbox calculations for two-panel layout
- Optimized rendering for navigation items and sub-tabs

## Dependencies on Other Features

### Prerequisites

- **Core Modal Dialog Implementation** - Provides Dialog foundation and dimensions
- **Settings Modal State Management** - Provides state for navigation and modal control

### Provides Foundation For

- **Content sections** - Provides shell structure for all future settings sections
- **Keyboard Navigation** - Provides navigation structure for keyboard shortcuts
- **Form management** - Provides Save/Cancel buttons for future form handling

## Integration Points

### With Core Modal Dialog

- Uses Dialog components as foundation for shell structure
- Inherits modal dimensions, positioning, and overlay behavior
- Maintains proper modal lifecycle and accessibility features

### With State Management

- Navigation panel subscribes to `activeSection` and `activeSubTab` state
- Header close button triggers `closeModal()` action
- Footer buttons integrate with modal state for save/cancel functionality
- All navigation interactions update Zustand store state

### With Future Content Sections

- Content area provides mounting point for dynamic section components
- Navigation state determines which content section to render
- Shell provides consistent layout context for all settings sections
- Save/Cancel buttons will integrate with section-specific form state

### With Electron Integration

- Modal shell ready to receive open commands from Electron menu
- Close button provides consistent way to dismiss modal from any trigger source
- Shell structure supports keyboard shortcuts that will be implemented

### With Responsive Design

- Shell layout adapts to different screen sizes and orientations
- Navigation panel collapse/expand behavior ready for mobile interactions
- Content area responsive behavior supports various content types

### Log
