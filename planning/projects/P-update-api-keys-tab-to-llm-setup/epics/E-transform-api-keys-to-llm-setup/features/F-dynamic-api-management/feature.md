---
kind: feature
id: F-dynamic-api-management
title: Dynamic API Management
status: done
priority: normal
prerequisites:
  - F-empty-state-and-modal-components
created: "2025-08-04T11:08:37.796558"
updated: "2025-08-04T19:38:38.835245+00:00"
schema_version: "1.1"
parent: E-transform-api-keys-to-llm-setup
---

## Overview

Implement dynamic API configuration management with full CRUD operations. This feature enables users to add multiple LLM provider configurations, edit existing ones, and delete them with confirmation. The provider cards will display the configured APIs with appropriate actions.

## Scope and Deliverables

### 1. Provider Card Component

- Display configured API information
- Edit and delete action buttons
- Full-width card layout
- Custom name and provider type display

### 2. State Management

- Local state for managing multiple API configurations
- Add new configurations from modal
- Update existing configurations
- Remove configurations

### 3. Edit Functionality

- Pre-fill modal with existing configuration
- Update configuration on save
- Maintain configuration ID for updates

### 4. Delete Functionality

- Confirmation dialog implementation
- Remove configuration from state
- Focus management after deletion

## Detailed Acceptance Criteria

### Provider Card Component

- ✓ Component named `LlmProviderCard.tsx` in llm-setup directory
- ✓ Full-width card with consistent padding
- ✓ Displays custom name prominently (e.g., "My ChatGPT API")
- ✓ Shows provider type below name (OpenAI/Anthropic)
- ✓ Edit button on the right side
- ✓ Delete button with destructive styling
- ✓ Hover states for interactive elements
- ✓ Follows existing card patterns from ProviderCard

### State Management

- ✓ Main component maintains array of configurations
- ✓ Each configuration has:
  - Unique ID (generated)
  - Custom name
  - Provider type
  - API key
  - Base URL
  - Authorization header setting
- ✓ Add configuration appends to array
- ✓ Edit updates specific configuration
- ✓ Delete removes from array

### Edit Flow

- ✓ Click edit button opens modal
- ✓ Modal title shows "Edit [Configuration Name]"
- ✓ All fields pre-populated with current values
- ✓ Provider type non-editable in edit mode
- ✓ Save updates the configuration
- ✓ Cancel discards changes

### Delete Flow

- ✓ Click delete triggers confirmation dialog
- ✓ Dialog message: "Delete API Configuration?"
- ✓ Dialog subtext: "This action cannot be undone."
- ✓ Yes/No buttons
- ✓ Yes removes configuration
- ✓ No closes dialog
- ✓ Focus returns to appropriate element

### Dynamic Display

- ✓ Show empty state when no configurations
- ✓ Show card list when configurations exist
- ✓ Smooth transitions between states
- ✓ Cards stack vertically with spacing

## Implementation Guidance

### Component Structure

```tsx
// LlmProviderCard.tsx
- Use Card components from shadcn/ui
- Edit button: variant="ghost" with Pencil icon
- Delete button: variant="ghost" with Trash icon
- Consistent spacing and typography

// State Structure
interface LlmConfiguration {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  apiKey: string;
  baseUrl: string;
  useAuthHeader: boolean;
}
```

### Delete Confirmation

- Use AlertDialog from shadcn/ui
- Proper focus trap
- Destructive action styling
- Clear messaging

### ID Generation

- Use simple timestamp or incremental ID
- Ensure uniqueness for UI keys
- No persistence needed

## Testing Requirements

### Manual Testing

- Add multiple configurations
- Edit each configuration
- Delete configurations
- Test empty state transitions
- Verify card displays correctly
- Test all interactive elements

### Edge Cases

- Long custom names (text truncation)
- Many configurations (scrolling)
- Rapid add/delete operations
- Edit/delete during transitions

### Accessibility

- Cards announce configuration details
- Edit/delete buttons have clear labels
- Confirmation dialog properly announced
- Keyboard navigation works throughout

## Security Considerations

- Never log API keys
- API keys remain masked in cards
- No actual API calls made
- Sensitive data stays in component state

## Performance Requirements

- Smooth list updates when adding/removing
- No lag on edit/delete actions
- Efficient re-renders on state changes
- Quick modal open/close

### Log
