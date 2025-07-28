---
kind: task
id: T-implement-collapsible-behavior
title: Implement collapsible behavior sliders section
status: open
priority: normal
prerequisites:
  - T-create-custom-instructions
created: "2025-07-28T17:04:19.358818"
updated: "2025-07-28T17:04:19.358818"
schema_version: "1.1"
parent: F-personalities-section
---

# Implement Collapsible Behavior Sliders Section

## Context

Create a collapsible section containing 14 behavior trait sliders for fine-tuning personality characteristics beyond the Big Five traits. This provides advanced customization while keeping the interface manageable.

## Implementation Requirements

### Collapsible Container Structure

Create `BehaviorSlidersSection.tsx`:

- Use shadcn/ui Collapsible component as foundation
- **Header**: "Advanced Behavior Settings" with expand/collapse toggle
- **Animation**: Smooth 200ms expand/collapse transition
- **State persistence**: Remember expanded state during session
- **Visual indicators**: Clear expand/collapse icons (chevron up/down)

### Component Architecture

```typescript
interface BehaviorSlidersSectionProps {
  behaviors: BehaviorTraits;
  onChange: (behavior: string, value: number) => void;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}
```

### 14 Behavior Sliders Implementation

Organize sliders in logical groups within the collapsible section:

**Communication Style (4 sliders)**

- Formality Level (0-100)
- Verbosity (0-100)
- Enthusiasm (0-100)
- Directness (0-100)

**Interaction Approach (4 sliders)**

- Helpfulness (0-100)
- Patience (0-100)
- Curiosity (0-100)
- Empathy (0-100)

**Reasoning Style (3 sliders)**

- Analytical Thinking (0-100)
- Creativity (0-100)
- Caution Level (0-100)

**Response Characteristics (3 sliders)**

- Detail Level (0-100)
- Question Asking (0-100)
- Example Usage (0-100)

### Visual Design Requirements

- **Toggle button**: Clearly labeled with expand/collapse state
- **Section spacing**: Proper padding and margins within collapsed area
- **Slider organization**: Group related behaviors with subtle visual separation
- **Consistent styling**: Match Big Five sliders appearance
- **Default state**: Collapsed initially to reduce cognitive load

### Accessibility Features

- **ARIA labels**: Proper labeling for collapsible region
- **Keyboard navigation**: Enter/Space to toggle, Tab to navigate sliders
- **Screen reader support**: Announce expanded/collapsed state
- **Focus management**: Maintain focus after toggle operations
- **Section description**: Brief explanation of behavior customization

### State Management

- Integrate with personality form state
- Preserve slider values during collapse/expand
- Session persistence for expanded state
- Default values (50) for all behavior sliders
- Form validation for behavior values

### User Experience Enhancements

- **Smooth animations**: 200ms transition for expand/collapse
- **Visual feedback**: Clear indication of interactive elements
- **Progressive disclosure**: Hide complexity until user requests it
- **Contextual help**: Optional tooltips explaining each behavior trait

### Collapsible Toggle Implementation

```typescript
const [isExpanded, setIsExpanded] = useState(false);

const toggleExpanded = () => {
  setIsExpanded(!isExpanded);
  // Persist state to sessionStorage
  sessionStorage.setItem("behavior-sliders-expanded", String(!isExpanded));
};
```

## Acceptance Criteria

- [ ] Collapsible section with clear "Advanced Behavior Settings" header
- [ ] 14 behavior sliders organized in logical groups
- [ ] Smooth 200ms animation for expand/collapse transitions
- [ ] Toggle button with clear expand/collapse indicators
- [ ] State persistence during tab sessions
- [ ] All sliders follow same styling as Big Five sliders
- [ ] Proper spacing and visual hierarchy within section
- [ ] Keyboard accessibility for toggle and slider navigation
- [ ] Screen reader support for collapsible functionality
- [ ] Default collapsed state to reduce initial cognitive load

## Testing Requirements

- Unit tests for collapsible toggle functionality
- Test all 14 behavior sliders work correctly
- Verify smooth animations and transitions
- Test state persistence across tab switches
- Accessibility testing for keyboard navigation
- Screen reader testing for collapsible announcements
- Performance testing for animation smoothness
- Integration testing with form state management

## Dependencies

- shadcn/ui Collapsible component
- Individual slider components (consistent with Big Five sliders)
- Form state management utilities
- Session storage for state persistence
- Animation/transition utilities

## Security Considerations

- Validate all behavior slider values (0-100 range)
- Sanitize behavior trait names and descriptions
- Protect against malicious state manipulation
- Secure session storage usage

## Performance Requirements

- Smooth 200ms animations without jank
- Efficient rendering of 14 sliders when expanded
- Optimized re-renders during slider interactions
- Fast toggle operations (< 100ms response time)
- Minimal impact on overall form performance

### Log
