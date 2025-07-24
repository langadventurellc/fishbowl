---
kind: task
id: T-create-inputcontainerdisplay
title: Create InputContainerDisplay component with showcase integration
status: open
priority: normal
prerequisites:
  - T-create-input-component-prop
  - T-create-messageinputdisplay
  - T-create-sendbuttondisplay
  - T-create-modetoggledisplay
created: "2025-07-24T11:36:26.961755"
updated: "2025-07-24T11:36:26.961755"
schema_version: "1.1"
parent: F-input-display-components
---

# Create InputContainerDisplay Component

## Context

Extract and create the InputContainerDisplay component from DesignPrototype.tsx as a composition component that brings together all the individual input display components. This component demonstrates how MessageInputDisplay, SendButtonDisplay, and ModeToggleDisplay work together in the complete input area layout.

## Technical Approach

1. **Extract styling** from DesignPrototype.tsx inputArea styles (lines 397-405)
2. **Create composition component** using InputContainerDisplayProps
3. **Import and compose child components** (MessageInputDisplay, SendButtonDisplay, ModeToggleDisplay)
4. **Support layout variants** for different spacing/sizing
5. **Add to ComponentShowcase** immediately for verification with all child components
6. **Write unit tests** for layout variants and component composition

## Implementation Requirements

### Component Location:

`apps/desktop/src/components/ui/input/InputContainerDisplay.tsx`

### Component Structure:

```typescript
import { InputContainerDisplayProps } from "@fishbowl-ai/shared";
import { MessageInputDisplay } from "./MessageInputDisplay";
import { SendButtonDisplay } from "./SendButtonDisplay";
import { ModeToggleDisplay } from "./ModeToggleDisplay";

export function InputContainerDisplay(props: InputContainerDisplayProps) {
  // Composition component that brings together all input components
  // Provides flex layout, spacing, and border styling
  // Uses MessageInputDisplay, SendButtonDisplay, and ModeToggleDisplay

  return (
    <div style={containerStyles}>
      <MessageInputDisplay {...messageInputProps} />
      <SendButtonDisplay {...sendButtonProps} />
      <ModeToggleDisplay {...modeToggleProps} />
    </div>
  );
}
```

### Layout Variants:

- **Default**: Standard spacing and layout from DesignPrototype (16px padding, 12px gap)
- **Compact**: Reduced padding and gap for smaller screens (12px padding, 8px gap)

### Child Component Props:

The component will create appropriate props for each child component:

- **MessageInputDisplay**: placeholder, content, size based on layout variant
- **SendButtonDisplay**: disabled state, loading state
- **ModeToggleDisplay**: currentMode (default to "manual"), disabled state

### Styling Requirements:

- Extract from DesignPrototype.tsx lines 397-405
- MinHeight: 72px
- Flex display with 12px gap
- Padding: 16px
- Background color using theme variables
- Border-top styling with theme border color
- AlignItems: flex-end for proper component alignment

### Showcase Integration:

Add section to ComponentShowcase.tsx:

```typescript
// InputContainerDisplay showcase - Complete Input Area Composition
- Default layout showing all child components working together
- Compact layout variant with all components
- Different theme compatibility (light/dark)
- Various child component state combinations:
  - Empty input with enabled send button
  - Input with content and loading send button
  - Disabled state for all components
  - Different mode toggle states (manual/auto)
- Demonstrates complete input area as unified composition
```

## Acceptance Criteria

- [ ] Component created in `apps/desktop/src/components/ui/input/`
- [ ] Uses InputContainerDisplayProps from shared package
- [ ] Imports and composes MessageInputDisplay, SendButtonDisplay, ModeToggleDisplay
- [ ] Provides proper flex layout for child components
- [ ] Exact visual match with DesignPrototype input container (lines 397-405)
- [ ] Layout variants (default, compact) implemented with appropriate child props
- [ ] Theme variable integration complete
- [ ] Added to ComponentShowcase demonstrating complete input area composition
- [ ] Unit tests cover layout variants, child rendering, and composition
- [ ] TypeScript strict mode compliance
- [ ] Component under 150 lines (slightly larger due to composition logic)

## Dependencies

- T-create-input-component-prop (InputContainerDisplayProps)
- T-create-messageinputdisplay (MessageInputDisplay component)
- T-create-sendbuttondisplay (SendButtonDisplay component)
- T-create-modetoggledisplay (ModeToggleDisplay component)
- Theme variables from packages/ui-theme/src/claymorphism-theme.css
- ComponentShowcase.tsx for integration

## Security Considerations

- Composition component with safe child component rendering
- All child components are display-only with no interactive functionality
- Props are type-safe and validated across all child components

### Log
