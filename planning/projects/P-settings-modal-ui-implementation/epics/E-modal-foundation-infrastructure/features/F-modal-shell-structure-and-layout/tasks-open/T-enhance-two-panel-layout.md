---
kind: task
id: T-enhance-two-panel-layout
title: Enhance two-panel layout structure with exact dimensions and responsive behavior
status: open
priority: high
prerequisites: []
created: "2025-07-26T20:49:53.731385"
updated: "2025-07-26T20:49:53.731385"
schema_version: "1.1"
parent: F-modal-shell-structure-and-layout
---

# Two-Panel Layout Enhancement

## Context

Enhance the existing two-panel layout in `SettingsModal.tsx` to meet exact UI specification requirements for navigation panel width, content area layout, visual separation, and responsive behavior at specific breakpoints.

## Current State Analysis

- Basic two-panel layout exists in `SettingsModal.tsx`
- Navigation panel has responsive width but needs exact dimension refinement
- Content area layout needs maximum width constraints and proper spacing
- Visual separation between panels needs enhancement

## Implementation Requirements

### Navigation Panel Specifications

- **Desktop Width**: Exactly 200px fixed width
- **Medium Screens** (< 1000px): Exactly 180px width
- **Mobile** (< 800px): Collapsible hamburger menu (full width when expanded)
- **Visual Separation**: 1px solid right border
- **Background**: Slightly different from content area
- **Padding**: 10px internal padding
- **Scrollable**: When navigation items exceed panel height

### Content Area Specifications

- **Layout**: Takes remaining width after navigation panel
- **Padding**: 30px on desktop, 20px on screens < 1000px
- **Scroll Behavior**: Vertical scroll when content exceeds modal height
- **Maximum Content Width**: 600px (centered if panel is wider)
- **Background**: Standard background color

### Responsive Breakpoints

1. **Large Screens** (≥ 1000px):
   - Navigation: 200px fixed width
   - Content: Remaining width, 30px padding
   - Both panels visible

2. **Medium Screens** (< 1000px, ≥ 800px):
   - Modal: 95% viewport width
   - Navigation: 180px fixed width
   - Content: Remaining width, 20px padding

3. **Small Screens** (< 800px):
   - Navigation: Collapsible hamburger menu
   - Content: Full width when navigation hidden
   - Content: 20px padding

### Layout Container Structure

```tsx
// Main layout container
<div className="modal-body-layout">
  <NavigationPanel
    width={getNavigationWidth()}
    collapsed={isNavigationCollapsed}
  />
  <ContentArea maxWidth="600px" padding={getContentPadding()} />
</div>
```

### CSS Grid/Flexbox Implementation

- Use CSS Grid or Flexbox for layout structure
- Ensure proper proportions maintained at all screen sizes
- Smooth transitions when navigation panel collapses/expands
- No layout thrashing during responsive breakpoint changes

### Acceptance Criteria

- [ ] Navigation panel exactly 200px width on desktop
- [ ] Navigation panel exactly 180px width on medium screens (< 1000px)
- [ ] Navigation becomes collapsible on screens < 800px
- [ ] Content area takes remaining width appropriately
- [ ] Visual separation: 1px solid border between panels
- [ ] Content area padding: 30px desktop, 20px reduced screens
- [ ] Maximum content width: 600px (centered when wider)
- [ ] Smooth responsive transitions without layout thrashing
- [ ] Vertical scrolling works correctly in both panels
- [ ] Layout maintains proper proportions at all breakpoints

## Technical Approach

### 1. Update Layout Container CSS

- Refine CSS Grid/Flexbox properties for exact dimensions
- Implement proper responsive breakpoint handling
- Add smooth transitions for panel width changes

### 2. Enhance Navigation Panel

- Update existing `SettingsNavigation.tsx` width calculations
- Ensure proper border and background styling
- Implement collapsible behavior improvements

### 3. Enhance Content Area

- Update existing `SettingsContent.tsx` layout styles
- Add maximum width constraints and centering
- Implement responsive padding adjustments

### 4. Responsive Implementation

- Use Tailwind CSS breakpoints for exact specifications
- Implement smooth transitions between states
- Test layout behavior at all breakpoints

## Files to Modify

1. `apps/desktop/src/components/settings/SettingsModal.tsx`
   - Update main layout container CSS classes
   - Refine responsive behavior implementation

2. `apps/desktop/src/components/settings/SettingsNavigation.tsx`
   - Update width calculations for exact specifications
   - Enhance border and visual separation styling

3. `apps/desktop/src/components/settings/SettingsContent.tsx`
   - Add maximum width constraints (600px)
   - Implement responsive padding adjustments

## Dependencies

- Must work with existing modal structure
- Must maintain compatibility with existing navigation and content components
- Must use existing Tailwind CSS configuration

## Testing Requirements

- Layout testing at all responsive breakpoints
- Visual separation testing (border appearance)
- Scroll behavior testing in both panels
- Transition smoothness testing during breakpoint changes
- Performance testing for layout calculation efficiency
- Cross-browser compatibility testing

## Performance Considerations

- Efficient CSS Grid/Flexbox calculations
- Smooth transitions without performance degradation
- Optimized rendering during responsive state changes

### Log
