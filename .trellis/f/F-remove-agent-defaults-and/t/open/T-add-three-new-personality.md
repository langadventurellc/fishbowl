---
id: T-add-three-new-personality
title: Add Three New Personality Behaviors to PersonalityForm
status: open
priority: high
parent: F-remove-agent-defaults-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T18:29:04.320Z
updated: 2025-08-20T18:29:04.320Z
---

## Context

Enhance the `PersonalityForm` component by adding three new behavior sliders: Response Length, Randomness, and Focus. These join the existing four behaviors (humor, formality, brevity, assertiveness) to provide users with more granular control over agent personality characteristics.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `apps/desktop/src/components/Agent/PersonalityForm.tsx`

## Implementation Requirements

### Primary Deliverables

1. **Add New Behavior Configurations**
   - Add "responseLength" behavior with labels "Brief" to "Comprehensive"
   - Add "randomness" behavior with labels "Predictable" to "Creative"
   - Add "focus" behavior with labels "Exploratory" to "Focused"
   - Maintain consistent behavior configuration structure

2. **Integrate with Existing Form Logic**
   - Ensure new behaviors work with existing slider components
   - Verify form validation includes new behaviors (-100 to 100 range)
   - Confirm form submission includes new behavior values
   - Test form reset/default behavior for new fields

3. **Update Component with Unit Tests**
   - Test PersonalityForm renders all 7 behaviors (4 existing + 3 new)
   - Test new behavior sliders function correctly
   - Test form validation for new behavior ranges
   - Verify form submission includes new behavior values

### Technical Approach

**Current Behavior Configuration (from research):**

```typescript
const behaviors: BehaviorConfig[] = [
  {
    id: "humor",
    label: "Humor",
    description: "How often the agent uses humor in responses",
    lowLabel: "Serious",
    highLabel: "Humorous",
  },
  {
    id: "formality",
    label: "Formality",
    description: "The level of formality in communication",
    lowLabel: "Casual",
    highLabel: "Formal",
  },
  {
    id: "brevity",
    label: "Brevity",
    description: "How concise or detailed responses are",
    lowLabel: "Detailed",
    highLabel: "Concise",
  },
  {
    id: "assertiveness",
    label: "Assertiveness",
    description: "How confident and direct the agent is",
    lowLabel: "Gentle",
    highLabel: "Assertive",
  },
];
```

**Target Behavior Configuration:**

```typescript
const behaviors: BehaviorConfig[] = [
  // ... existing 4 behaviors ...
  {
    id: "responseLength",
    label: "Response Length",
    description: "Controls the typical length of agent responses",
    lowLabel: "Brief",
    highLabel: "Comprehensive",
  },
  {
    id: "randomness",
    label: "Randomness",
    description: "How predictable or creative the agent's responses are",
    lowLabel: "Predictable",
    highLabel: "Creative",
  },
  {
    id: "focus",
    label: "Focus",
    description:
      "How closely the agent stays on topic versus exploring tangents",
    lowLabel: "Exploratory",
    highLabel: "Focused",
  },
];
```

### Step-by-Step Implementation

**Step 1: Update Behaviors Array**

1. Locate the `behaviors` array in `PersonalityForm.tsx`
2. Add the three new behavior configurations to the end of the array
3. Verify the configuration structure matches existing behaviors

**Step 2: Test Form Integration**

1. Verify new behaviors render as sliders in the form
2. Test slider functionality (drag, click, value updates)
3. Confirm form validation works for new behavior ranges
4. Test form submission includes new behavior values

**Step 3: Create/Update Unit Tests**
Create test file: `apps/desktop/src/components/Agent/__tests__/PersonalityForm.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalityForm } from '../PersonalityForm';

describe('PersonalityForm', () => {
  it('renders all 7 personality behaviors', () => {
    render(<PersonalityForm />);

    // Verify existing behaviors
    expect(screen.getByText('Humor')).toBeInTheDocument();
    expect(screen.getByText('Formality')).toBeInTheDocument();
    expect(screen.getByText('Brevity')).toBeInTheDocument();
    expect(screen.getByText('Assertiveness')).toBeInTheDocument();

    // Verify new behaviors
    expect(screen.getByText('Response Length')).toBeInTheDocument();
    expect(screen.getByText('Randomness')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('displays correct labels for new behaviors', () => {
    render(<PersonalityForm />);

    // Test Response Length labels
    expect(screen.getByText('Brief')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive')).toBeInTheDocument();

    // Test Randomness labels
    expect(screen.getByText('Predictable')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();

    // Test Focus labels
    expect(screen.getByText('Exploratory')).toBeInTheDocument();
    expect(screen.getByText('Focused')).toBeInTheDocument();
  });

  it('initializes new behaviors to default value (0)', () => {
    const mockInitialValues = {
      personalityBehaviors: {
        humor: 0,
        formality: 0,
        brevity: 0,
        assertiveness: 0,
        responseLength: 0,
        randomness: 0,
        focus: 0,
      }
    };

    render(<PersonalityForm initialValues={mockInitialValues} />);

    // Verify sliders are at neutral position (implementation may vary based on slider component)
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(7);
  });

  it('handles behavior value changes correctly', () => {
    const mockOnChange = jest.fn();
    render(<PersonalityForm onChange={mockOnChange} />);

    // Test changing a new behavior value (implementation depends on slider component)
    // This is a placeholder - actual implementation will depend on how sliders work
    const responseLengthSlider = screen.getByLabelText(/response length/i);

    fireEvent.change(responseLengthSlider, { target: { value: '50' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        responseLength: 50
      })
    );
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] PersonalityForm displays 7 total behaviors (4 existing + 3 new)
- [ ] Response Length slider with "Brief" to "Comprehensive" labels
- [ ] Randomness slider with "Predictable" to "Creative" labels
- [ ] Focus slider with "Exploratory" to "Focused" labels
- [ ] All new behaviors initialize to default value (0)
- [ ] New behaviors save correctly when form is submitted

### User Interface Requirements

- [ ] Personality section shows all 7 sliders in logical order
- [ ] New behavior sliders follow existing design patterns
- [ ] Slider labels and descriptions are clear and intuitive
- [ ] Form layout maintains proper spacing and visual consistency

### Technical Requirements

- [ ] Behavior configuration follows existing BehaviorConfig interface
- [ ] Form validation includes new behaviors with -100 to 100 range
- [ ] TypeScript compilation succeeds without errors
- [ ] Form state management works correctly for new behaviors

### Testing Requirements

- [ ] Unit test verifies all 7 behaviors render correctly
- [ ] Unit test confirms new behavior labels are displayed
- [ ] Unit test validates new behaviors initialize to 0
- [ ] Unit test checks new behaviors save correctly in form submission
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `apps/desktop/src/components/Agent/PersonalityForm.tsx`
2. **Test File**: `apps/desktop/src/components/Agent/__tests__/PersonalityForm.test.tsx` (create if doesn't exist)

## Dependencies

**Prerequisites**: None - this task can be completed independently

**Blocks**:

- Agent creation/editing with enhanced personality options
- Personality configuration validation updates

## Security Considerations

**Input Validation**: Ensure new behavior values are properly validated to the -100 to 100 range to prevent invalid data submission.

## Testing Strategy

**Unit Testing Approach:**

- Test component renders all 7 behaviors
- Verify new behavior labels and descriptions
- Test slider functionality for new behaviors
- Confirm form validation and submission includes new behaviors

**Manual Testing:**

1. Open agent creation/editing form
2. Navigate to personality section
3. Verify all 7 behavior sliders are present
4. Test new slider functionality and labels
5. Create/edit agent and verify new behaviors save

**Test Commands:**

```bash
# Run specific component tests
pnpm test PersonalityForm

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Implementation Notes

- Follow exact behavior configuration structure from existing behaviors
- Maintain consistent ordering - add new behaviors at the end
- Ensure behavior IDs match the type definitions that will be updated in other tasks
- Use descriptive and user-friendly labels and descriptions
- Test slider functionality works identically to existing behaviors

## Success Criteria

1. **Complete Set**: All 7 personality behaviors render correctly (4 existing + 3 new)
2. **Proper Labels**: New behaviors display appropriate low/high labels
3. **Functional Integration**: New behaviors work with existing form logic
4. **Default Values**: New behaviors initialize to neutral position (0)
5. **Form Submission**: New behavior values included in form data
6. **Test Coverage**: Unit tests verify all new behavior functionality
7. **Quality Checks**: TypeScript and ESLint pass without errors

This task significantly enhances the personality customization capabilities by providing users with more granular control over agent behavior characteristics.
