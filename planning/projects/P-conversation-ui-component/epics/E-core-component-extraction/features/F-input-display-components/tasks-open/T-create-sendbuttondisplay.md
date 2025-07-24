---
kind: task
id: T-create-sendbuttondisplay
title: Create SendButtonDisplay component with showcase integration
status: open
priority: normal
prerequisites:
  - T-create-input-component-prop
created: "2025-07-24T11:35:58.840738"
updated: "2025-07-24T11:35:58.840738"
schema_version: "1.1"
parent: F-input-display-components
---

# Create SendButtonDisplay Component

## Context

Extract and create the SendButtonDisplay component from DesignPrototype.tsx as a pure display component showing the visual representation of the send button without click functionality.

## Technical Approach

1. **Extract styling** from DesignPrototype.tsx sendButton styles (lines 422-435)
2. **Create pure display component** using SendButtonDisplayProps
3. **Support visual states** for enabled, disabled, and loading
4. **Add to ComponentShowcase** immediately for verification

## Implementation Requirements

### Component Location:

`apps/desktop/src/components/ui/input/SendButtonDisplay.tsx`

### Component Structure:

```typescript
import { SendButtonDisplayProps } from "@fishbowl-ai/shared";

export function SendButtonDisplay(props: SendButtonDisplayProps) {
  // Pure display component showing send button appearance
  // No onClick handler - display only
  // Support disabled and loading visual states
}
```

### Visual States to Support:

- **Enabled**: Full opacity, primary color background
- **Disabled**: Reduced opacity (0.5), not-allowed cursor appearance
- **Loading**: Loading spinner or indicator (visual only)

### Styling Requirements:

- Extract from DesignPrototype.tsx lines 422-435
- Width: 40px, Height: 40px, BorderRadius: 8px
- Primary background color with theme variables
- Consistent sizing and positioning
- Send icon (➤ or similar) centered
- Support light/dark theme variants

### Showcase Integration:

Add section to ComponentShowcase.tsx:

```typescript
// SendButtonDisplay showcase
- Enabled state with send icon
- Disabled state with reduced opacity
- Loading state with visual indicator
- Light/dark theme compatibility
```

## Acceptance Criteria

- [ ] Component created in `apps/desktop/src/components/ui/input/`
- [ ] Uses SendButtonDisplayProps from shared package
- [ ] No onClick or interactive functionality
- [ ] Exact visual match with DesignPrototype send button
- [ ] All visual states (enabled, disabled, loading) implemented
- [ ] Theme variable integration complete
- [ ] Added to ComponentShowcase with state demonstrations
- [ ] TypeScript strict mode compliance
- [ ] Component under 100 lines

## Dependencies

- T-create-input-component-prop (SendButtonDisplayProps)
- Theme variables from packages/ui-theme/src/claymorphism-theme.css
- ComponentShowcase.tsx for integration

## Security Considerations

- Pure display component with no action handling
- Props are type-safe and validated

### Log
