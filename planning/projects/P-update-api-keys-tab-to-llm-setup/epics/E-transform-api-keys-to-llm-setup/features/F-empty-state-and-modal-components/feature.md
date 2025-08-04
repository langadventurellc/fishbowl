---
kind: feature
id: F-empty-state-and-modal-components
title: Empty State and Modal Components
status: in-progress
priority: normal
prerequisites:
  - F-code-migration-and-setup
created: "2025-08-04T11:08:07.427181"
updated: "2025-08-04T11:08:07.427181"
schema_version: "1.1"
parent: E-transform-api-keys-to-llm-setup
---

## Overview

Build the empty state experience and configuration modal components for the LLM Setup interface. This feature creates the core UI components needed for users to add and configure LLM provider APIs through a modal-based flow.

## Scope and Deliverables

### 1. Empty State Component

- Centered layout with descriptive messaging
- Provider dropdown (OpenAI, Anthropic)
- Setup button that triggers modal
- Follow existing empty state patterns (e.g., EmptyLibraryState)

### 2. Configuration Modal

- Stacked modal implementation (modal on top of settings modal)
- Form with all required fields
- Keyboard shortcut support
- Provider-specific defaults

### 3. Form Components

- Custom name input field
- API key field with show/hide toggle
- Base URL field with defaults
- Authorization header checkbox

## Detailed Acceptance Criteria

### Empty State Component

- ✓ Component named `EmptyLlmState.tsx` in llm-setup directory
- ✓ Centered layout matching existing empty states
- ✓ Clear messaging: "No LLM providers configured" or similar
- ✓ Dropdown shows "OpenAI" and "Anthropic" options
- ✓ Dropdown updates button text: "Set up OpenAI" or "Set up Anthropic"
- ✓ Button click triggers modal open

### Configuration Modal

- ✓ Component named `LlmConfigModal.tsx` in llm-setup directory
- ✓ Opens on top of existing settings modal with proper z-index
- ✓ Modal title shows "Configure [Provider Name]"
- ✓ Contains all required form fields
- ✓ Save button enabled at all times (no validation)
- ✓ Cancel button closes without saving
- ✓ Escape key closes modal
- ✓ Ctrl/Cmd+S triggers save action

### Form Fields

- ✓ Custom name field:
  - Placeholder: "e.g., My ChatGPT API"
  - Required for save
  - Text input type
- ✓ API key field:
  - Password input with show/hide toggle
  - Toggle button uses Eye/EyeOff icons
  - Placeholder: "Enter your API key"
- ✓ Base URL field:
  - Shows provider-specific default
  - OpenAI: "https://api.openai.com/v1"
  - Anthropic: "https://api.anthropic.com"
- ✓ Authorization header checkbox:
  - Label: "Send API key in authorization header"
  - Unchecked by default

### UI/UX Requirements

- ✓ Modal backdrop darkens settings modal
- ✓ Smooth transitions (200ms) for modal open/close
- ✓ Form uses React Hook Form for consistency
- ✓ All fields properly labeled for accessibility
- ✓ Focus management when modal opens/closes

## Implementation Guidance

### Component Structure

```tsx
// EmptyLlmState.tsx
- Use Select component from shadcn/ui for dropdown
- Use Button component for setup action
- Center using flex layout

// LlmConfigModal.tsx
- Use Dialog component from shadcn/ui
- Implement form with React Hook Form
- Use Input, Checkbox components
- Custom show/hide logic for API key field
```

### State Management

- Provider selection in empty state (local state)
- Form state managed by React Hook Form
- No persistence needed (UI only)
- Pass configuration data up through callbacks

### Modal Stacking

- Use Portal to render above settings modal
- Proper z-index management (e.g., z-50 or higher)
- Backdrop should not close settings modal

## Testing Requirements

### Manual Testing

- Open settings and navigate to LLM Setup
- Verify empty state displays correctly
- Select different providers in dropdown
- Click setup button and verify modal opens
- Test all form fields
- Test keyboard shortcuts
- Verify modal closes properly

### Accessibility Testing

- Tab through all interactive elements
- Screen reader announces form labels
- Escape key works consistently
- Focus returns to trigger button on close

## Security Considerations

- API key field must be password type by default
- No logging of sensitive data
- Form accepts any input (no validation)

## Performance Requirements

- Modal animations complete within 200ms
- No lag when toggling show/hide on API key
- Form interactions feel immediate
- Smooth dropdown interactions

### Log
