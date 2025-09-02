---
id: T-refactor-llmprovidercard-to
title: Refactor LlmProviderCard to use SettingsCard with simplified content
status: open
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-02T02:46:25.555Z
updated: 2025-09-02T02:46:25.555Z
---

## Context

Refactor the LlmProviderCard component to use the new SettingsCard component while simplifying its content display to show only the provider name, removing complex provider info, API key masking, and timestamps.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Simplify the existing LlmProviderCard to use SettingsCard with minimal content display.

**File to modify**: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

### Content Transformation

Replace the complex multi-line content with simplified display:

- **Title**: `configuration.customName` (unchanged)
- **Content**: `providerInfo.label` (e.g., "OpenAI", "Anthropic")

### Remove Complex Features

- Remove API key masking logic and display
- Remove timestamp formatting and display
- Remove authorization header information
- Remove provider-specific color coding
- Simplify JSDoc to reflect new simplified purpose

### Handler Transformation

Transform existing handlers to match SettingsCard signature:

- `onEdit: () => onEdit(configuration)` (wrap existing handler)
- `onDelete: () => onDelete(configuration.id)` (wrap existing handler)

### Preserve Essential Logic

- Keep provider info resolution for display name
- Maintain React.memo optimization
- Preserve TypeScript types for props interface
- Keep existing accessibility aria-label patterns

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays configuration.customName as title
- ✅ Displays provider label (OpenAI/Anthropic) as content
- ✅ Edit button triggers existing onEdit with configuration object
- ✅ Delete button triggers existing onDelete with configuration ID
- ✅ Maintains existing prop interface (LlmProviderCardProps)

### Simplification Requirements

- ✅ Removes API key masking functionality and display
- ✅ Removes timestamp formatting and relative time display
- ✅ Removes authorization header information display
- ✅ Removes provider-specific color coding
- ✅ Eliminates complex multi-line content layout
- ✅ Removes helper functions: maskApiKey, formatRelativeTime

### Code Quality Requirements

- ✅ Uses SettingsCard import from ui components
- ✅ Maintains React.memo optimization with updated comparison
- ✅ Updates JSDoc comments to reflect simplified functionality
- ✅ Removes unused imports (complex styling, unused icons)
- ✅ Preserves TypeScript strict mode compliance
- ✅ Clean, readable code following project conventions

### Integration Requirements

- ✅ Works with existing LLM setup page without changes
- ✅ Maintains same external API (props interface)
- ✅ Preserves accessibility for screen readers
- ✅ Visual consistency with other SettingsCard uses

## Technical Approach

1. **Component Structure Refactor**:
   - Replace Card/CardContent structure with SettingsCard
   - Simplify render method to use new component
   - Remove complex layout and styling logic
   - Keep provider info resolution for label

2. **Handler Transformation**:
   - Wrap onEdit to pass configuration object
   - Wrap onDelete to pass configuration ID
   - Maintain callback signature compatibility

3. **Content Simplification**:
   - Use getProviderInfo result for content display
   - Remove all complex content sections
   - Keep only essential provider identification

4. **Cleanup**:
   - Remove unused helper functions and constants
   - Remove unused imports and dependencies
   - Update JSDoc to reflect simplified purpose
   - Maintain performance optimization

## Dependencies

- T-create-settingscard-component (must complete first)
- Existing LlmConfigMetadata types (unchanged)
- Parent component contracts remain unchanged

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays configuration.customName correctly
- ✅ Content displays provider label correctly
- ✅ Edit handler passes configuration object to onEdit
- ✅ Delete handler passes configuration ID to onDelete
- ✅ Custom className prop works correctly
- ✅ Memoization prevents unnecessary re-renders

### Integration Testing

- ✅ Works correctly in LLM setup settings page
- ✅ Provider configurations display properly
- ✅ Edit and delete operations function correctly
- ✅ Visual consistency maintained with other cards

## Security Considerations

- ✅ No sensitive API key data displayed (removed from content)
- ✅ Callback functions properly scoped and validated
- ✅ Configuration data handled securely
- ✅ No XSS risks in simplified content display

## Out of Scope

- Changes to parent components or LLM setup page
- Modifications to LlmConfigMetadata type definitions
- Complex provider-specific styling or features
- API key management or security features
- Timestamp or audit trail functionality
