---
kind: task
id: T-create-messageinputdisplay
title: Create MessageInputDisplay component with showcase integration
status: open
priority: normal
prerequisites:
  - T-create-input-component-prop
created: "2025-07-24T11:35:46.686971"
updated: "2025-07-24T11:35:46.686971"
schema_version: "1.1"
parent: F-input-display-components
---

# Create MessageInputDisplay Component

## Context

Extract and create the MessageInputDisplay component from DesignPrototype.tsx (lines 406-421) as a pure display component without interactive functionality. This represents the visual appearance of the message input textarea - the actual text input area where users would type messages. This component merges the textarea functionality into a single semantic component.

## Technical Approach

1. **Extract styling** from DesignPrototype.tsx textarea styles (lines 406-421)
2. **Create pure display component** using MessageInputDisplayProps (includes textarea properties)
3. **Convert to theme variables** from claymorphism-theme.css
4. **Support auto-resize visual appearance** without actual resizing functionality
5. **Add to ComponentShowcase** immediately for visual verification
6. **Write unit tests** for different visual states and content lengths

## Implementation Requirements

### Component Location:

`apps/desktop/src/components/ui/input/MessageInputDisplay.tsx`

### Component Structure:

```typescript
import { MessageInputDisplayProps } from "@fishbowl-ai/shared";

export function MessageInputDisplay(props: MessageInputDisplayProps) {
  // Pure display component - no event handlers
  // Use props for content, placeholder, disabled state
  // Apply styling from DesignPrototype with theme variables
}
```

### Visual States to Support:

- **Empty state**: Show placeholder text
- **With content**: Display provided content at appropriate height
- **Different content lengths**: Visual representation of auto-resize behavior
- **Disabled state**: Reduced opacity and disabled styling
- **Focused appearance**: Visual focus styling (no actual focus behavior)

### Styling Requirements:

- Extract styles from DesignPrototype.tsx lines 406-421 (textarea styles)
- Flex: 1 for full width within container
- MinHeight: 40px, MaxHeight: 180px for auto-resize appearance
- Padding: 12px, BorderRadius: 8px
- Border and background colors using theme variables
- Font size: 14px, resize: none, overflow: hidden
- Modern CSS fieldSizing: content for auto-sizing appearance
- Support both light and dark themes

### Showcase Integration:

Add section to ComponentShowcase.tsx:

```typescript
// MessageInputDisplay showcase with different states
- Empty state with placeholder
- Short content (single line)
- Medium content (multiple lines)
- Long content (approaching max height)
- Disabled state
- Different size variants
- Different resize behavior settings
- Light/dark theme compatibility
```

## Acceptance Criteria

- [ ] Component created in `apps/desktop/src/components/ui/input/`
- [ ] Uses MessageInputDisplayProps from shared package (includes textarea properties)
- [ ] No event handlers or interactive functionality
- [ ] Exact visual match with DesignPrototype textarea
- [ ] Auto-resize visual appearance maintained
- [ ] Different content length states implemented
- [ ] Theme variable integration complete
- [ ] Added to ComponentShowcase with all states demonstrated
- [ ] Unit tests cover all visual states and content lengths
- [ ] TypeScript strict mode compliance
- [ ] Component under 100 lines

## Dependencies

- T-create-input-component-prop (MessageInputDisplayProps)
- Theme variables from packages/ui-theme/src/claymorphism-theme.css
- ComponentShowcase.tsx for integration

## Security Considerations

- Pure display component with no user input handling
- Content is safely rendered without HTML interpretation
- Props are type-safe and validated

### Log
