---
id: F-create-agent-feature
title: Create Agent Feature
status: in-progress
priority: medium
parent: E-agent-management-features
prerequisites:
  - F-settings-navigation
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentFormModal.tsx:
    Replaced placeholder implementation with complete modal functionality
    following RoleFormModal patterns - added focus management, accessibility
    features, keyboard shortcuts, unsaved changes protection, and proper
    AgentForm integration
log: []
schema: v1.0
childrenIds:
  - T-implement-agentformmodal-with
  - T-wire-up-create-new-agent
  - T-complete-agentform-field
created: 2025-08-19T21:13:42.425Z
updated: 2025-08-19T21:13:42.425Z
---

## Purpose

Implement the complete agent creation functionality with modal, form handling, validation, and persistence.

## Key Components to Implement

- Agent creation modal component
- Agent form with all required fields
- Selection components (ModelSelect, RoleSelect, PersonalitySelect)
- Form validation with Zod schema
- Save functionality with IPC handlers
- Optimistic UI updates

## Detailed Acceptance Criteria

### Modal and Form

- **Create Button**: "Create New Agent" button opens modal with empty form
- **Form Fields**: All fields displayed with proper initial values:
  - Name field (required, 2-100 characters)
  - Model dropdown (required)
  - Role dropdown (required)
  - Personality dropdown (required)
  - Temperature slider (0-2, step 0.1, default from settings)
  - Max Tokens input (1-4000, default from settings)
  - Top P slider (0-1, step 0.01, default from settings)
  - System Prompt textarea (optional, max 5000 chars with counter)

### Model Selection

- **ModelSelect Component**: Dropdown populated from LLM configurations
- **Provider Integration**: Query useLlmConfig hook for available models
- **Model Display**: Show model name with provider (e.g., "GPT-4 (OpenAI)")
- **Empty State**: Show "No LLM configurations" message if none exist
- **Dynamic Updates**: Refresh when LLM configs change

### Role and Personality Selection

- **RoleSelect Component**: Populate from useRolesStore
- **PersonalitySelect Component**: Populate from usePersonalitiesStore
- **Error Handling**: Handle loading and error states gracefully
- **Validation**: Both selections are required fields

### Validation and Saving

- **Name Uniqueness**: Validate name is unique across all agents
- **Form Validation**: All required fields must be filled
- **Error Messages**: Display clear validation errors
- **Success Save**: Agent added to library immediately
- **Success Feedback**: Show success notification to user
- **Modal Close**: Close modal after successful save

### Modal Behavior

- **Background Interaction**: Prevent interaction with background
- **Escape Key**: Close modal (check for unsaved changes)
- **Click Outside**: Close modal (check for unsaved changes)
- **Focus Trap**: Keep focus within modal
- **Focus Management**: Restore focus on close

## Technical Requirements

- Use React Hook Form for form management
- Implement Zod schema for validation
- Use Zustand store for state management
- Implement IPC handlers for persistence
- Follow existing modal patterns from roles/personalities

## Implementation Guidance

1. Create agentSchema.ts with Zod validation
2. Implement selection components (ModelSelect, RoleSelect, PersonalitySelect)
3. Build AgentForm component with React Hook Form
4. Create agent creation modal wrapper
5. Implement useAgentsStore with create action
6. Add IPC handlers for saving agents
7. Wire up optimistic updates in UI

## Testing Requirements

- Verify all form fields render correctly
- Test name uniqueness validation
- Verify model dropdown populates from LLM configs
- Test role/personality dropdowns load data
- Verify successful save adds to library
- Test modal keyboard interactions
- Verify error states and messages

## Security Considerations

- Validate all inputs with Zod schema
- Sanitize user input before persistence
- Prevent XSS in system prompt field
- Validate model/role/personality IDs exist

## Performance Requirements

- Form validation < 100ms
- Modal open/close animations smooth
- Dropdown loading states responsive
- Save operation < 500ms
