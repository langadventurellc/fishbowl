---
id: T-refactor-agentcard-to-use
title: Refactor AgentCard to use SettingsCard while preserving model resolution
status: open
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-02T02:47:34.664Z
updated: 2025-09-02T02:47:34.664Z
---

## Context

Refactor AgentCard component to use SettingsCard while preserving the complex LLM model resolution logic and role display functionality. This is the most complex refactoring as it must maintain model lookup and role resolution.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/agents/AgentCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Refactor AgentCard to use SettingsCard while preserving essential business logic.

**File to modify**: `apps/desktop/src/components/settings/agents/AgentCard.tsx`

### Content Transformation

Transform existing content to SettingsCard format:

- **Title**: `agent.name` (unchanged)
- **Content**: `${modelDisplayName} • ${roleDisplayName}` (combined model and role)

### Preserve Complex Logic

- Keep LLM model resolution: `models.find()` with configId and model matching
- Keep role display name resolution: `getRoleById(agent.role)?.name || agent.role`
- Keep useLlmModels hook usage
- Maintain model display name fallback logic

### Handler Transformation

Transform existing handlers to match SettingsCard signature:

- `onEdit: () => onEdit?.(agent.id)` (wrap existing handler)
- `onDelete: () => onDelete?.(agent.id)` (wrap existing handler)

### Preserve Essential Features

- Keep accessibility patterns for screen readers
- Maintain AgentCardProps interface compatibility
- Preserve model and role resolution business logic
- Keep optional callback handling

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays agent.name as title
- ✅ Displays model and role names as combined content
- ✅ Edit button triggers onEdit with agent.id (optional callback)
- ✅ Delete button triggers onDelete with agent.id (optional callback)
- ✅ Maintains existing prop interface (AgentCardProps)

### Business Logic Preservation

- ✅ Resolves LLM model using configId and model id matching
- ✅ Falls back to agent.model string if model not found
- ✅ Resolves role display name using getRoleById
- ✅ Falls back to agent.role string if role not found
- ✅ Maintains useLlmModels hook for model lookup
- ✅ Content format: "{modelName} • {roleName}"

### Code Quality Requirements

- ✅ Uses SettingsCard import from ui components
- ✅ Preserves useLlmModels and getRoleById imports
- ✅ Maintains AgentCardProps import from ui-shared
- ✅ Clean, readable implementation
- ✅ Removes unused Card component imports
- ✅ Updates JSDoc comments for refactored component
- ✅ TypeScript strict mode compliance

### Integration Requirements

- ✅ Works with existing agents settings/library page without changes
- ✅ Maintains same external API (props interface unchanged)
- ✅ Visual consistency with other SettingsCard implementations
- ✅ Preserves agent data display accuracy

## Technical Approach

1. **Component Structure Refactor**:
   - Replace Card/CardHeader/CardContent structure with SettingsCard
   - Consolidate model and role resolution into content generation
   - Remove manual Button implementation and toolbar semantics
   - Simplify render method while preserving business logic

2. **Content Generation**:
   - Keep existing model resolution logic with configId/model matching
   - Keep existing role resolution with getRoleById lookup
   - Combine resolved names into formatted content string
   - Maintain fallback logic for both model and role names

3. **Handler Transformation**:
   - Remove individual handleEdit and handleDelete functions
   - Use inline arrow functions to wrap existing callbacks
   - Maintain optional callback pattern with conditional execution
   - Pass agent.id to parent handlers

4. **Logic Preservation**:
   - Keep useLlmModels hook and models.find logic
   - Keep getRoleById import and role resolution
   - Maintain model display name calculation
   - Preserve accessibility id generation patterns

## Dependencies

- T-create-settingscard-component (must complete first)
- Existing useLlmModels hook (unchanged)
- getRoleById utility from ui-shared (unchanged)
- AgentCardProps interface (unchanged)

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays agent.name correctly
- ✅ Model resolution works with configId and model matching
- ✅ Role resolution works with getRoleById lookup
- ✅ Content format combines model and role with bullet separator
- ✅ Edit handler passes agent.id to onEdit when provided
- ✅ Delete handler passes agent.id to onDelete when provided
- ✅ Handles missing onEdit/onDelete callbacks gracefully
- ✅ Fallback logic works when model or role not found

### Integration Testing

- ✅ Works correctly in agents library page
- ✅ Agent data displays properly with resolved names
- ✅ Edit and delete operations function correctly
- ✅ Model and role lookups work in real data scenarios
- ✅ Visual consistency maintained with other cards

## Security Considerations

- ✅ Agent data safely displayed without XSS risks
- ✅ Model and role resolution properly scoped
- ✅ Callback functions validated before execution
- ✅ No sensitive model or agent data exposed

## Out of Scope

- Changes to AgentCardProps interface or AgentCard type
- Modifications to useLlmModels hook or getRoleById utility
- Changes to parent agents library or settings components
- Model or role data validation beyond existing patterns
- Advanced model resolution algorithms or caching
