---
id: T-replace-personalitycard-with
title: Replace PersonalityCard with SettingsCard implementation
status: open
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-02T02:46:49.118Z
updated: 2025-09-02T02:46:49.118Z
---

## Context

Replace the PersonalityCard component entirely with SettingsCard implementation. This component maps most directly to the new SettingsCard pattern and requires minimal transformation.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/personalities/PersonalityCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Replace the PersonalityCard implementation to use SettingsCard while preserving all existing functionality.

**File to modify**: `apps/desktop/src/components/settings/personalities/PersonalityCard.tsx`

### Content Transformation

Transform existing content to SettingsCard format:

- **Title**: `personality.name` (unchanged)
- **Content**: `${behaviorCount} behaviors • ${customInstructionsPreview}` (formatted string)

### Handler Transformation

Transform existing handlers to match SettingsCard signature:

- `onEdit: () => onEdit(personality)` (wrap existing handler)
- `onDelete: () => onDelete(personality)` (wrap existing handler)

### Preserve Existing Logic

- Keep behavior count calculation: `Object.keys(personality.behaviors).length`
- Keep custom instructions preview with truncation (50 chars + "...")
- Maintain PersonalityCardProps interface compatibility
- Preserve accessibility patterns

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays personality.name as title
- ✅ Displays behavior count and instructions preview as content
- ✅ Edit button triggers existing onEdit with personality object
- ✅ Delete button triggers existing onDelete with personality object
- ✅ Maintains existing prop interface (PersonalityCardProps)

### Content Requirements

- ✅ Behavior count calculated from personality.behaviors object keys
- ✅ Custom instructions preview truncated at 50 characters with ellipsis
- ✅ Content format: "{count} behaviors • {preview}"
- ✅ Fallback to "No custom instructions" when customInstructions is empty
- ✅ Content combines both elements in readable format

### Code Quality Requirements

- ✅ Uses SettingsCard import from ui components
- ✅ Maintains PersonalityCardProps import from ui-shared
- ✅ Clean, readable implementation
- ✅ Removes unused Card component imports
- ✅ Updates JSDoc comments for simplified component
- ✅ TypeScript strict mode compliance

### Integration Requirements

- ✅ Works with existing personalities settings page without changes
- ✅ Maintains same external API (props interface unchanged)
- ✅ Visual consistency with other SettingsCard implementations
- ✅ Preserves hover effects and accessibility

## Technical Approach

1. **Component Structure Replacement**:
   - Replace entire Card/CardHeader/CardFooter structure with SettingsCard
   - Consolidate content generation into single formatted string
   - Remove Button imports and manual button implementation
   - Simplify component to functional wrapper

2. **Content Generation**:
   - Calculate behavior count from personality.behaviors
   - Generate custom instructions preview with truncation
   - Combine into formatted content string
   - Handle empty/null custom instructions gracefully

3. **Handler Transformation**:
   - Remove individual handleEdit and handleDelete functions
   - Use inline arrow functions to wrap existing callbacks
   - Maintain personality object passing to parent handlers

4. **Import Cleanup**:
   - Add SettingsCard import from ui components
   - Remove unused Card, Button, and icon imports
   - Keep PersonalityCardProps import from ui-shared
   - Remove React import if only using types

## Dependencies

- T-create-settingscard-component (must complete first)
- Existing PersonalityViewModel and PersonalityCardProps types (unchanged)
- Parent component contracts remain unchanged

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays personality.name correctly
- ✅ Behavior count calculated correctly from behaviors object
- ✅ Custom instructions preview truncated at 50 chars
- ✅ Content format matches "{count} behaviors • {preview}" pattern
- ✅ Edit handler passes personality object to onEdit
- ✅ Delete handler passes personality object to onDelete
- ✅ Handles empty custom instructions with fallback text

### Integration Testing

- ✅ Works correctly in personalities settings page
- ✅ Personality data displays properly
- ✅ Edit and delete operations function correctly
- ✅ Visual consistency maintained with design system

## Security Considerations

- ✅ Custom instructions content safely displayed
- ✅ No XSS risks in personality name or instructions
- ✅ Callback functions properly scoped
- ✅ Personality data handled securely

## Out of Scope

- Changes to PersonalityViewModel or PersonalityCardProps interfaces
- Modifications to parent personality settings components
- Personality data validation or processing logic
- Advanced content formatting beyond basic truncation
