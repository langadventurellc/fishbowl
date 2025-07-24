---
kind: task
id: T-create-modetoggledisplay
title: Create ConversationModeToggleDisplay component with showcase integration
status: open
priority: normal
prerequisites:
  - T-create-input-component-prop
created: "2025-07-24T11:36:12.915040"
updated: "2025-07-24T11:36:12.915040"
schema_version: "1.1"
parent: F-input-display-components
---

# Create ConversationModeToggleDisplay Component

## Context

Extract and create the ConversationModeToggleDisplay component from DesignPrototype.tsx showing the visual representation of the Manual/Auto mode toggle without interactive functionality.

## Technical Approach

1. **Extract styling** from DesignPrototype.tsx modeToggle and modeOption styles (lines 436-456)
2. **Create pure display component** using ModeToggleDisplayProps
3. **Support both mode states** (manual/auto) visually
4. **Add to ComponentShowcase** immediately for verification
5. **Write unit tests** for both mode states

## Implementation Requirements

### Component Location:

`apps/desktop/src/components/ui/input/ConversationModeToggleDisplay.tsx`

### Component Structure:

```typescript
import { ModeToggleDisplayProps } from "@fishbowl-ai/shared";

export function ConversationModeToggleDisplay(props: ModeToggleDisplayProps) {
  // Pure display component showing mode toggle appearance
  // No onClick handler - display currentMode visually
  // Show Manual/Auto options with active state styling
}
```

### Visual States to Support:

- **Manual mode active**: "Manual" highlighted, "Auto" normal
- **Auto mode active**: "Auto" highlighted, "Manual" normal
- **Disabled state**: Reduced opacity for entire toggle

### Styling Requirements:

- Extract from DesignPrototype.tsx lines 436-456
- Height: 40px with flex layout
- Border and background colors using theme variables
- Active mode gets primary background color
- Inactive mode has transparent background
- Border radius: 8px for container, 4px for options
- Font size: 12px, weight: 500

### Showcase Integration:

Add section to ComponentShowcase.tsx:

```typescript
// ConversationModeToggleDisplay showcase
- Manual mode active state
- Auto mode active state
- Disabled state
- Light/dark theme compatibility
```

## Acceptance Criteria

- [ ] Component created in `apps/desktop/src/components/ui/input/`
- [ ] Uses ModeToggleDisplayProps from shared package
- [ ] No click handlers or interactive functionality
- [ ] Exact visual match with DesignPrototype mode toggle
- [ ] Both mode states (manual/auto) implemented correctly
- [ ] Disabled state visual representation
- [ ] Theme variable integration complete
- [ ] Added to ComponentShowcase with state demonstrations
- [ ] Unit tests cover all visual states
- [ ] TypeScript strict mode compliance
- [ ] Component under 100 lines

## Dependencies

- T-create-input-component-prop (ModeToggleDisplayProps)
- Theme variables from packages/ui-theme/src/claymorphism-theme.css
- ComponentShowcase.tsx for integration

## Security Considerations

- Pure display component with no user interaction
- Props are type-safe and validated

### Log
