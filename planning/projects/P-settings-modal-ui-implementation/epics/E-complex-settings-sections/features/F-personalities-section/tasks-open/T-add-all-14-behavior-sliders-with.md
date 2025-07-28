---
kind: task
id: T-add-all-14-behavior-sliders-with
title: Add all 14 behavior sliders with proper organization
status: open
priority: normal
prerequisites:
  - T-implement-collapsible-behavior
created: "2025-07-28T17:04:53.934902"
updated: "2025-07-28T17:04:53.934902"
schema_version: "1.1"
parent: F-personalities-section
---

# Add All 14 Behavior Sliders with Proper Organization

## Context

Implement the complete set of 14 behavior sliders within the collapsible section, properly organized into logical groups with descriptive labels and tooltips for enhanced personality customization.

## Implementation Requirements

### Complete Behavior Slider Definitions

Create `BehaviorSliders.tsx` with all 14 sliders organized in groups:

### Group 1: Communication Style (4 sliders)

```typescript
const COMMUNICATION_BEHAVIORS = {
  formality: {
    label: "Formality Level",
    description:
      "How formal or casual the personality's language and tone should be",
    min: 0,
    max: 100,
    default: 50,
  },
  verbosity: {
    label: "Verbosity",
    description: "How detailed and lengthy responses should be",
    min: 0,
    max: 100,
    default: 50,
  },
  enthusiasm: {
    label: "Enthusiasm",
    description: "How energetic and excited the personality appears",
    min: 0,
    max: 100,
    default: 50,
  },
  directness: {
    label: "Directness",
    description: "How straightforward vs diplomatic the personality should be",
    min: 0,
    max: 100,
    default: 50,
  },
};
```

### Group 2: Interaction Approach (4 sliders)

```typescript
const INTERACTION_BEHAVIORS = {
  helpfulness: {
    label: "Helpfulness",
    description: "How proactive the personality is in offering assistance",
    min: 0,
    max: 100,
    default: 75,
  },
  patience: {
    label: "Patience",
    description:
      "How tolerant the personality is with repeated or unclear questions",
    min: 0,
    max: 100,
    default: 70,
  },
  curiosity: {
    label: "Curiosity",
    description: "How often the personality asks follow-up questions",
    min: 0,
    max: 100,
    default: 60,
  },
  empathy: {
    label: "Empathy",
    description: "How much the personality considers emotional context",
    min: 0,
    max: 100,
    default: 65,
  },
};
```

### Group 3: Reasoning Style (3 sliders)

```typescript
const REASONING_BEHAVIORS = {
  analyticalThinking: {
    label: "Analytical Thinking",
    description: "How systematic and logical the reasoning approach should be",
    min: 0,
    max: 100,
    default: 70,
  },
  creativity: {
    label: "Creativity",
    description: "How innovative and unconventional solutions should be",
    min: 0,
    max: 100,
    default: 60,
  },
  cautionLevel: {
    label: "Caution Level",
    description: "How careful and risk-averse the personality should be",
    min: 0,
    max: 100,
    default: 60,
  },
};
```

### Group 4: Response Characteristics (3 sliders)

```typescript
const RESPONSE_BEHAVIORS = {
  detailLevel: {
    label: "Detail Level",
    description: "How comprehensive and thorough explanations should be",
    min: 0,
    max: 100,
    default: 65,
  },
  questionAsking: {
    label: "Question Asking",
    description:
      "How frequently the personality should ask clarifying questions",
    min: 0,
    max: 100,
    default: 55,
  },
  exampleUsage: {
    label: "Example Usage",
    description: "How often responses should include concrete examples",
    min: 0,
    max: 100,
    default: 70,
  },
};
```

### Visual Organization Implementation

- **Group headers**: Clear section titles for each behavior category
- **Visual separation**: Subtle borders or spacing between groups
- **Consistent styling**: Match Big Five slider appearance exactly
- **Logical flow**: Order groups from most to least commonly used
- **Tooltips**: Hover/focus tooltips explaining each behavior impact

### Component Structure

```typescript
interface BehaviorSlidersProps {
  values: BehaviorTraits;
  onChange: (behavior: string, value: number) => void;
}

const BehaviorSliders: React.FC<BehaviorSlidersProps> = ({ values, onChange }) => {
  return (
    <div className="behavior-sliders">
      <BehaviorGroup
        title="Communication Style"
        behaviors={COMMUNICATION_BEHAVIORS}
        values={values}
        onChange={onChange}
      />
      <BehaviorGroup
        title="Interaction Approach"
        behaviors={INTERACTION_BEHAVIORS}
        values={values}
        onChange={onChange}
      />
      <BehaviorGroup
        title="Reasoning Style"
        behaviors={REASONING_BEHAVIORS}
        values={values}
        onChange={onChange}
      />
      <BehaviorGroup
        title="Response Characteristics"
        behaviors={RESPONSE_BEHAVIORS}
        values={values}
        onChange={onChange}
      />
    </div>
  );
};
```

### Default Values Strategy

- **High helpfulness** (75) - Users expect helpful AI
- **High patience** (70) - Important for good user experience
- **Medium-high detail** (65) - Balanced information level
- **Medium-high examples** (70) - Examples aid understanding
- **All others at 50** - Neutral starting point for customization

### Accessibility Implementation

- **Group landmarks**: ARIA regions for each behavior group
- **Slider labels**: Clear, descriptive labels for each slider
- **Tooltips**: Keyboard accessible with focus/escape behavior
- **Tab order**: Logical navigation through all 14 sliders
- **Screen reader**: Proper announcements for slider values and groups

### State Management Integration

- Form state integration for all 14 behavior values
- Validation for each slider (0-100 range)
- Reset functionality to default values
- Persistence during form navigation
- Change tracking for unsaved modifications

## Acceptance Criteria

- [ ] All 14 behavior sliders implemented with correct labels
- [ ] Sliders organized into 4 logical groups with clear headers
- [ ] Each slider has proper range (0-100) and default values
- [ ] Tooltips provide helpful descriptions for each behavior
- [ ] Visual organization with proper spacing and separation
- [ ] Consistent styling matching Big Five sliders
- [ ] Form state integration preserves all 14 values
- [ ] Keyboard navigation works across all sliders and groups
- [ ] Screen readers announce group context and slider values
- [ ] All sliders respond smoothly to user interaction

## Testing Requirements

- Unit tests for all 14 behavior sliders functionality
- Test proper grouping and visual organization
- Verify form state integration for all behavior values
- Test keyboard navigation across groups and sliders
- Accessibility testing with screen readers for group context
- Tooltip functionality and keyboard access testing
- Performance testing with all 14 sliders active
- Integration testing with collapsible section behavior

## Dependencies

- Collapsible behavior section from T-implement-collapsible-behavior
- shadcn/ui Slider components (consistent with Big Five)
- Tooltip components for behavior descriptions
- Form state management utilities
- ARIA accessibility utilities

## Security Considerations

- Validate all 14 behavior values are within 0-100 range
- Sanitize behavior names and descriptions
- Prevent manipulation of slider configurations
- Secure handling of behavior trait data

## Performance Requirements

- Smooth interaction across all 14 sliders simultaneously
- Efficient re-renders when any single slider changes
- Fast tooltip display and hide operations (< 100ms)
- Optimized group rendering for smooth scrolling
- Minimal impact on overall form performance with all sliders active

### Log
