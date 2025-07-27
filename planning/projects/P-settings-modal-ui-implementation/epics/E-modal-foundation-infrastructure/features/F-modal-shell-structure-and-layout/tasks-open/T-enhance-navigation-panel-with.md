---
kind: task
id: T-enhance-navigation-panel-with
title:
  Enhance navigation panel with exact item specifications and sub-navigation
  support
status: open
priority: normal
prerequisites: []
created: "2025-07-26T20:50:24.132283"
updated: "2025-07-26T20:50:24.132283"
schema_version: "1.1"
parent: F-modal-shell-structure-and-layout
---

# Navigation Panel Enhancement

## Context

Enhance the existing `SettingsNavigation.tsx` component to meet exact UI specification requirements for navigation item dimensions, interactive states, sub-navigation support, and proper integration with the modal shell structure.

## Current State Analysis

- Basic navigation structure exists with responsive behavior
- Navigation items need exact height and styling specifications
- Sub-navigation support needed for Agents, Personalities, and Roles sections
- Interactive states need refinement for active/hover/focus states

## Implementation Requirements

### Navigation Item Specifications

- **Height**: Exactly 40px per navigation item
- **Padding**: 12px horizontal, centered vertical alignment
- **Border Radius**: 4px for each navigation item
- **Item Spacing**: Proper vertical spacing between items

### Interactive States

1. **Default State**: No background, standard text color
2. **Hover State**: Light background tint, smooth transition
3. **Active State**:
   - Darker background with accent color
   - 3px left accent border (primary color)
   - Text color adjustment for contrast
4. **Focus State**: Proper keyboard focus indicators for accessibility

### Sub-Navigation Support

Support for sections with sub-tabs:

- **Agents Section**: Library, Templates, Defaults tabs
- **Personalities Section**: Saved, Create New tabs
- **Roles Section**: Predefined, Custom tabs

Sub-navigation rendering:

```tsx
<NavigationItem
  id="agents"
  label="Agents"
  active={activeSection === "agents"}
  hasSubTabs={true}
>
  <SubNavigationTabs visible={activeSection === "agents"}>
    <SubTab id="library" label="Library" />
    <SubTab id="templates" label="Templates" />
    <SubTab id="defaults" label="Defaults" />
  </SubNavigationTabs>
</NavigationItem>
```

### Zustand State Integration

- Integrate with `activeSection` and `activeSubTab` state
- Support for `setActiveSection` and `setActiveSubTab` actions
- Maintain navigation state during modal session

### Navigation Structure

Main sections as specified:

1. **General** (no sub-navigation)
2. **API Keys** (no sub-navigation)
3. **Appearance** (no sub-navigation)
4. **Agents** (with sub-navigation: Library, Templates, Defaults)
5. **Personalities** (with sub-navigation: Saved, Create New)
6. **Roles** (with sub-navigation: Predefined, Custom)
7. **Advanced** (no sub-navigation)

### Styling Requirements

```tsx
// Navigation item container
height: 40px
padding: 12px horizontal
border-radius: 4px
display: flex
align-items: center

// Active state styling
background: darker accent background
border-left: 3px solid primary color
text-color: accent-foreground

// Hover state
background: light accent tint
transition: smooth color transitions

// Sub-navigation styling
padding-left: additional indentation
smaller font size
conditional visibility based on parent active state
```

### Acceptance Criteria

- [ ] Each navigation item exactly 40px height
- [ ] Item padding: 12px horizontal with centered vertical alignment
- [ ] Border radius: 4px for each navigation item
- [ ] Interactive states: Default (no background), Hover (light tint), Active (darker background + 3px left accent border)
- [ ] Navigation items integrate with Zustand store for state management
- [ ] Sub-navigation support for Agents, Personalities, Roles sections
- [ ] Active section highlighting with proper visual feedback
- [ ] Sub-tab rendering and selection within applicable sections
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility with proper ARIA attributes

## Technical Approach

### 1. Update Navigation Item Component

- Refactor existing button-based navigation items
- Implement exact height and padding specifications
- Add proper interactive state styling

### 2. Implement Sub-Navigation Support

- Create `SubNavigationTabs` component for sections with tabs
- Add conditional rendering based on active section
- Implement proper indentation and styling for sub-items

### 3. Enhanced State Management

- Add `activeSubTab` state handling to existing Zustand integration
- Implement `setActiveSubTab` action integration
- Ensure proper state persistence during navigation

### 4. Accessibility Improvements

- Add proper ARIA attributes for navigation structure
- Implement keyboard navigation between items and sub-items
- Add screen reader announcements for navigation changes

## Files to Modify

1. `apps/desktop/src/components/settings/SettingsNavigation.tsx`
   - Update navigation item styling and dimensions
   - Add sub-navigation support
   - Enhance interactive states

2. Create new files:
   - `apps/desktop/src/components/settings/NavigationItem.tsx` (optional refactor)
   - `apps/desktop/src/components/settings/SubNavigationTabs.tsx`

## Zustand Store Integration

- Use existing `useSettingsModal()` hook
- Extend with `activeSubTab` and `setActiveSubTab` if not already present
- Maintain backward compatibility with existing state structure

## Dependencies

- Must work with existing Zustand store structure
- Must integrate with existing responsive layout
- Must use existing Button component patterns
- Must maintain existing accessibility features

## Testing Requirements

- Unit tests for navigation item rendering with different states
- Unit tests for sub-navigation functionality
- Unit tests for Zustand store integration
- Accessibility testing for keyboard navigation
- Visual regression tests for interactive states
- Integration tests for navigation flow

## Performance Considerations

- Efficient re-rendering when navigation state changes
- Smooth transitions for interactive states
- Optimized sub-navigation rendering
- Minimal layout recalculations during state changes

### Log
