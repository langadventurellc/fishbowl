---
kind: task
id: T-create-custom-instructions
title: Create custom instructions textarea component
status: open
priority: normal
prerequisites:
  - T-implement-big-five-personality
created: "2025-07-28T17:03:53.419136"
updated: "2025-07-28T17:03:53.419136"
schema_version: "1.1"
parent: F-personalities-section
---

# Create Custom Instructions Textarea Component

## Context

Implement the custom instructions textarea for the Create New tab, allowing users to provide detailed instructions that guide the AI personality's behavior and responses.

## Implementation Requirements

### Textarea Component Structure

Create `CustomInstructionsTextarea.tsx`:

- Use shadcn/ui Textarea component as foundation
- **Height**: 4 rows as specified in requirements
- **Label**: "Custom Instructions" with proper accessibility
- **Placeholder**: "Provide specific instructions for how this personality should behave and respond..."

### Textarea Configuration

```typescript
interface CustomInstructionsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}
```

### Validation and Constraints

- **Maximum length**: 500 characters (prevents excessive input)
- **Character counter**: Show remaining characters (e.g., "245/500")
- **Real-time validation**: Warning at 90% capacity
- **Required field**: Optional but recommended for users
- **Content filtering**: Basic inappropriate content detection

### Visual Design Requirements

- 4-row height with proper vertical sizing
- Consistent styling with other form elements
- Character counter positioned bottom-right
- Resize behavior disabled (fixed height)
- Proper focus states and visual feedback

### User Experience Features

- **Auto-resize**: Textarea grows with content (up to max height)
- **Character counter**: Visual feedback with color changes
- **Placeholder guidance**: Helpful examples in placeholder text
- **Save draft**: Auto-save to local storage during typing
- **Word wrap**: Proper line breaks for readability

### Enhanced Placeholder Text

```
"Provide specific instructions for how this personality should behave and respond. For example: 'Always respond with enthusiasm and ask follow-up questions' or 'Provide detailed technical explanations with examples.'"
```

### Character Counter Implementation

- Green: 0-400 characters (plenty of space)
- Yellow: 401-450 characters (warning)
- Red: 451-500 characters (approaching limit)
- Error state: Prevent input beyond 500 characters

### Form Integration

- Integrate with overall personality form state
- Validate on form submission
- Clear/reset functionality
- Preserve content during navigation
- Undo/redo capability (browser default)

### Accessibility Features

- Proper ARIA labels and descriptions
- Screen reader support for character count
- Keyboard navigation (Tab, Shift+Tab)
- Focus management and visual indicators
- Descriptive error messages

## Acceptance Criteria

- [ ] Textarea component with 4-row height as specified
- [ ] Character limit of 500 with real-time counter
- [ ] Placeholder text provides helpful guidance
- [ ] Character counter changes color based on usage
- [ ] Form integration preserves content during navigation
- [ ] Proper accessibility with ARIA labels
- [ ] Keyboard navigation works correctly
- [ ] Visual feedback for focus and validation states
- [ ] Content persists during tab switches
- [ ] Auto-save to prevent data loss (optional)

## Testing Requirements

- Unit tests for textarea functionality and validation
- Test character limit enforcement and counter display
- Verify form integration and state management
- Test accessibility with keyboard navigation
- Screen reader testing for character count announcements
- Edge case testing (paste operations, special characters)
- Performance testing for large text input

## Dependencies

- shadcn/ui Textarea component
- Form state management utilities
- Character counting utilities
- Local storage for draft saving (optional)
- Validation libraries for content filtering

## Security Considerations

- Input sanitization to prevent XSS attacks
- Content filtering for inappropriate material
- Validation of input length and format
- Protection against script injection
- Secure handling of user-generated content

## Performance Requirements

- Smooth typing experience with no input lag
- Efficient character counting without performance impact
- Optimized re-renders during typing
- Fast auto-save operations (if implemented)
- Responsive text wrapping and layout updates

### Log
