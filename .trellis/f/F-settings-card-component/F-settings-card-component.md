---
id: F-settings-card-component
title: Settings Card Component
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/components/SettingsCardProps.ts:
    Created new TypeScript interface file with comprehensive JSDoc documentation
    defining props for the unified SettingsCard component - includes title
    (string), content (ReactNode), onEdit/onDelete callbacks, and optional
    className prop
  packages/ui-shared/src/types/components/index.ts: Added export for
    SettingsCardProps interface in alphabetical order after FormHeaderProps to
    maintain consistent barrel export pattern
  apps/desktop/src/components/ui/SettingsCard.tsx: Created new SettingsCard
    component with React.memo optimization, hover-reveal action buttons,
    accessibility features, and shadcn Card component integration
  apps/desktop/src/components/ui/index.ts: Created barrel export file to
    centralize UI component exports following project conventions
  apps/desktop/src/components/settings/agents/LibraryTab.tsx: Replaced AgentCard
    usage with SettingsCard, moved model and role resolution business logic from
    AgentCard into AgentGrid component, updated imports to include getRoleById
    and useLlmModels, combined model and role names into content string format
  apps/desktop/src/components/settings/agents/AgentCard.tsx: Deleted -
    intermediate component no longer needed after refactoring LibraryTab to use
    SettingsCard directly
  apps/desktop/src/components/settings/agents/index.ts: Removed AgentCard export from barrel file since component was deleted
log: []
schema: v1.0
childrenIds:
  - T-refactor-agentcard-to-use
  - T-refactor-llmprovidercard-to
  - T-refactor-rolelistitem-to-use
  - T-replace-personalitycard-with
  - T-create-settingscard-component
  - T-create-settingscardprops
created: 2025-09-02T02:41:57.955Z
updated: 2025-09-02T02:41:57.955Z
---

## Purpose

Create a unified `SettingsCard` component to standardize the display and interaction patterns across all settings list items, replacing the inconsistent implementations in LlmProviderCard, PersonalityCard, RoleListItem, and AgentCard components.

## Functionality

The SettingsCard component will provide:

- Consistent card layout using shadcn Card components
- Primary title display with secondary content area
- Standardized Edit and Delete action buttons
- Hover effects and accessibility features
- Responsive design support

## Key Components to Implement

1. **SettingsCard Component** (`apps/desktop/src/components/ui/SettingsCard.tsx`)
   - React component with proper TypeScript typing
   - Consistent styling using shadcn Card, Button components
   - Right-aligned action buttons with hover reveal
   - Accessible ARIA labels and keyboard navigation

2. **Props Interface** (`packages/ui-shared/src/types/components/SettingsCardProps.ts`)
   - TypeScript interface definition
   - Simple 4-prop API: title, content, onEdit, onDelete

3. **Component Integration**
   - Replace existing card implementations
   - Simplify LlmProviderCard content display
   - Remove loading state complexity from RoleListItem
   - Update component exports and barrel files

## Detailed Acceptance Criteria

### Functional Behavior

- ✅ Component renders with title prominently displayed
- ✅ Secondary content area supports both string and ReactNode
- ✅ Edit button triggers onEdit callback when clicked
- ✅ Delete button triggers onDelete callback when clicked
- ✅ Action buttons are hidden by default, revealed on hover/focus
- ✅ Component accepts optional className prop for styling customization

### User Interface Requirements

- ✅ Uses shadcn Card component structure (CardHeader, CardContent)
- ✅ Title displays in header using h3 element with appropriate font weight
- ✅ Content displays in card body with proper text styling
- ✅ Edit button uses Edit2 icon from lucide-react
- ✅ Delete button uses Trash2 icon from lucide-react
- ✅ Buttons are icon-only, ghost variant, small size
- ✅ Hover effects include shadow elevation and button visibility
- ✅ Consistent spacing and typography with existing design system

### Integration Requirements

- ✅ LlmProviderCard simplified to show only provider name
- ✅ PersonalityCard replaced entirely with SettingsCard
- ✅ RoleListItem removes loading states, uses SettingsCard for layout
- ✅ AgentCard preserves model resolution logic but uses SettingsCard layout
- ✅ All parent components updated to use new SettingsCard

### Accessibility Requirements

- ✅ Proper ARIA labels for edit and delete actions
- ✅ Keyboard navigation support with focus management
- ✅ Screen reader announcements for button actions
- ✅ Role attributes for semantic structure
- ✅ Focus indicators follow design system patterns

### Browser Compatibility

- ✅ Works in Electron renderer environment
- ✅ Supports modern CSS features used in existing components
- ✅ Compatible with current React 19+ and TypeScript versions

## Implementation Guidance

### Technical Approach

1. **Component Architecture**: Use React.memo for performance optimization
2. **Styling System**: Leverage existing cn utility and focus styles
3. **Icon System**: Use lucide-react icons consistently
4. **Type Safety**: Full TypeScript coverage with proper interface definitions

### Code Patterns to Follow

- Follow existing component structure from analyzed components
- Use consistent button styling patterns from RoleListItem
- Apply hover effects similar to existing card components
- Maintain accessibility patterns from AgentCard implementation

### File Organization

- Place SettingsCard in `apps/desktop/src/components/ui/` directory
- Create props interface in `packages/ui-shared/src/types/components/`
- Update barrel exports in both locations
- Follow existing file naming conventions

## Testing Requirements

### Component Testing

- ✅ Renders with provided title and content
- ✅ Calls onEdit when edit button clicked
- ✅ Calls onDelete when delete button clicked
- ✅ Applies custom className when provided
- ✅ Shows/hides action buttons on hover states

### Integration Testing

- ✅ LlmProviderCard displays simplified content correctly
- ✅ PersonalityCard replacement maintains existing functionality
- ✅ RoleListItem editing and deletion still works
- ✅ AgentCard preserves model resolution display

### Accessibility Testing

- ✅ Screen reader can navigate and announce all elements
- ✅ Keyboard navigation works for all interactive elements
- ✅ Focus indicators are visible and clear
- ✅ ARIA labels provide meaningful descriptions

## Security Considerations

### Input Validation

- ✅ Sanitize content prop if it contains user-generated data
- ✅ Validate callback functions are properly defined
- ✅ Prevent XSS through proper content rendering

### Access Control

- ✅ Maintain existing permission checks in parent components
- ✅ Ensure edit/delete actions respect user authorization
- ✅ No sensitive data exposed in component props

## Performance Requirements

### Response Times

- ✅ Component renders within 16ms for smooth interactions
- ✅ Hover effects are immediate with CSS transitions
- ✅ No blocking operations during component lifecycle

### Resource Usage

- ✅ Minimal memory footprint through React.memo optimization
- ✅ Efficient re-rendering only when props change
- ✅ No memory leaks from event listeners

## Dependencies

### Technical Dependencies

- React 19+ with TypeScript support
- shadcn/ui Card and Button components
- lucide-react for icons
- Existing styling utilities (cn, focus styles)

### Implementation Dependencies

- No other features required
- Can be implemented independently
- Existing components will be refactored after SettingsCard creation

## Files to Modify/Create

### New Files

- `apps/desktop/src/components/ui/SettingsCard.tsx`
- `packages/ui-shared/src/types/components/SettingsCardProps.ts`

### Modified Files

- `apps/desktop/src/components/ui/index.ts` (export SettingsCard)
- `packages/ui-shared/src/types/components/index.ts` (export SettingsCardProps)
- `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx` (refactor)
- `apps/desktop/src/components/settings/personalities/PersonalityCard.tsx` (replace)
- `apps/desktop/src/components/settings/roles/RoleListItem.tsx` (refactor)
- `apps/desktop/src/components/settings/agents/AgentCard.tsx` (refactor)

## Definition of Done

- ✅ SettingsCard component created with full TypeScript support
- ✅ Props interface defined in shared package
- ✅ All four existing card components refactored to use SettingsCard
- ✅ Visual consistency achieved across all settings cards
- ✅ Loading state complexity removed from RoleListItem
- ✅ LlmProviderCard content simplified to provider name only
- ✅ All functionality preserved (edit/delete actions work)
- ✅ Accessibility maintained or improved
- ✅ Code quality checks pass (lint, type-check, format)
- ✅ Component exports updated in barrel files
