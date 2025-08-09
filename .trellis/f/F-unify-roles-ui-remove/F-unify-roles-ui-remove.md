---
id: F-unify-roles-ui-remove
title: Unify Roles UI - Remove Predefined/Custom Distinction
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T03:57:03.886Z
updated: 2025-08-09T03:57:03.886Z
---

# Unify Roles UI - Remove Predefined/Custom Distinction

## Overview

Simplify the roles section UI by eliminating the artificial distinction between "predefined" and "custom" roles. All roles will be treated equally as editable entries in a unified list interface, with some roles simply coming pre-configured as convenience samples.

## Current State Analysis

- **Two-tab interface**: "Predefined" and "Custom" tabs with different layouts and behaviors
- **Predefined tab**: Read-only grid layout with role cards showing "Read-only" badges
- **Custom tab**: Editable list layout with Edit/Delete functionality
- **Complex navigation**: TabContainer managing separate component rendering
- **Artificial restrictions**: Predefined roles treated as special/immutable

## Target State

- **Single unified interface**: No tab navigation, single list view
- **Consistent treatment**: All roles editable and deletable
- **List layout**: Adopt the current Custom tab's list-style interface
- **Sample data**: Pre-configured roles as starting examples (hard-coded for now)
- **Equal access**: No distinction between "types" of roles in the UI

## Detailed Acceptance Criteria

### UI Structure Changes

- **Remove TabContainer**: Eliminate tab navigation from RolesSection component
- **Single component**: Replace dual tabs with unified roles list interface
- **List layout**: Use current CustomRolesTab list design as the base layout
- **No read-only badges**: Remove all "Read-only" indicators and restrictions

### Role Data Handling

- **Hard-coded sample data**: Include current predefined roles (Project Manager, Technical Advisor, Creative Director, Storyteller, etc.) as sample data
- **Uniform structure**: All roles follow the same data structure (name, description, id, timestamps)
- **Mock functionality**: Edit/Delete buttons present but non-functional (placeholder actions)
- **List ordering**: Display roles in a logical order (alphabetical or by category)

### Component Modifications

- **RolesSection.tsx**: Remove tab configuration and modal handlers, simplify to single list view
- **Retain modals**: Keep RoleFormModal and RoleDeleteDialog for future functionality (but disabled)
- **Update imports**: Remove PredefinedRolesTab and related predefined-specific imports
- **Simplify state**: Remove tab-related state management

### Sample Data Requirements

- **Include all current predefined roles**: Project Manager, Technical Advisor, Creative Director, Storyteller, Analyst, Coach, Critic, Business Strategist, Financial Advisor, Generalist
- **Consistent format**: Each role includes name, description, and mock metadata (id, createdAt, updatedAt)
- **Categorization preserved**: Maintain role categories for potential future grouping (but not displayed as separate sections)

### Accessibility & UX

- **Screen reader support**: Maintain ARIA labels and descriptions for the unified list
- **Keyboard navigation**: Preserve Tab navigation through role items and buttons
- **Loading states**: Keep loading skeleton placeholders from CustomRolesTab
- **Empty states**: Remove empty state since we'll have sample data
- **Responsive design**: Maintain mobile-friendly list layout

### Future-Proofing

- **Component architecture**: Structure supports future addition of real CRUD functionality
- **Data layer ready**: Prepare for eventual JSON file persistence and API integration
- **Modal framework**: Keep modal structure for future edit/create functionality
- **State management**: Maintain hooks and context patterns for future data binding

## Implementation Guidance

### Component Refactoring Strategy

1. **Start with RolesSection**: Remove TabContainer and tab-related logic
2. **Adapt CustomRolesTab**: Use as base component but feed it hard-coded sample data
3. **Create sample data constant**: Define mock roles array matching CustomRoleViewModel structure
4. **Update prop interfaces**: Remove tab-specific props and handlers
5. **Simplify modal integration**: Keep modal components but disable actual functionality

### Code Organization

- **Keep existing file structure**: Maintain current component organization for future development
- **Remove unused components**: Delete or comment out PredefinedRolesTab-related files
- **Update barrel exports**: Modify index.ts files to reflect removed components
- **Preserve utilities**: Keep role-related utilities and schemas for future use

### Testing Considerations

- **Visual consistency**: Ensure unified list matches CustomRolesTab styling
- **Responsive behavior**: Test list layout across different screen sizes
- **Interaction feedback**: Verify Edit/Delete buttons show appropriate disabled states
- **Accessibility audit**: Confirm screen reader navigation works with single list

## Technical Requirements

### Dependencies

- **No new dependencies**: Use existing React, Material-UI, and internal components
- **Maintain current styling**: Preserve existing CSS classes and Tailwind utilities
- **Keep icons**: Retain current Lucide React icons for consistency

### Performance Considerations

- **Static data**: Hard-coded sample data eliminates loading time
- **Memoization**: Maintain React.memo optimizations from existing components
- **Minimal re-renders**: Avoid unnecessary state updates in simplified component

### Browser Support

- **Existing compatibility**: Maintain current browser support requirements
- **Responsive design**: Ensure list works across all supported screen sizes
- **Accessibility standards**: Meet WCAG guidelines with unified interface

## Testing Strategy

### Visual Testing

- **Screenshot comparison**: Compare before/after screenshots to ensure visual consistency
- **Responsive testing**: Verify layout works on mobile, tablet, and desktop
- **Dark/light themes**: Test appearance in both theme modes
- **Loading states**: Verify skeleton placeholders display correctly

### Functional Testing

- **Navigation**: Confirm removal of tab navigation doesn't break routing
- **Modal triggers**: Test that Edit/Delete buttons trigger (disabled) modals
- **Keyboard accessibility**: Verify Tab navigation works through role list
- **Screen reader**: Test with screen reader to ensure list is properly announced

### Integration Testing

- **Settings modal**: Ensure roles section integrates properly with settings navigation
- **Modal system**: Verify RoleFormModal and RoleDeleteDialog can still be opened
- **State management**: Confirm simplified state doesn't cause memory leaks

## Definition of Done

- [ ] TabContainer removed from RolesSection component
- [ ] Single unified list displays all sample roles
- [ ] No "Predefined" vs "Custom" distinction in UI
- [ ] All roles show Edit/Delete buttons (even if non-functional)
- [ ] Sample data includes all current predefined roles
- [ ] No "Read-only" badges or restrictions visible
- [ ] Component maintains responsive design
- [ ] Accessibility features preserved (ARIA labels, keyboard nav)
- [ ] Modal components remain integrated but disabled
- [ ] Visual consistency with current CustomRolesTab design
- [ ] No broken imports or unused component references
- [ ] Quality checks pass (lint, type-check, format)

## Future Implementation Notes

This refactoring sets up the UI structure for future features that will:

- Add real CRUD functionality to the Edit/Delete buttons
- Implement JSON file persistence for roles data
- Add role creation and import/export capabilities
- Enable role categorization and filtering options

The current task focuses solely on UI restructuring with sample data, preparing the interface for these future enhancements without implementing the underlying functionality.
