---
id: F-dynamic-personality-form
title: Dynamic Personality Form System
status: in-progress
priority: medium
parent: E-dynamic-personality
prerequisites:
  - F-dynamic-personality-slider
affectedFiles:
  apps/desktop/src/components/settings/personalities/DynamicBehaviorSections.tsx:
    Created new dynamic behaviors component that renders personality sections
    and traits using PersonalitySlider. Supports loading/error states,
    accessibility features, and performance optimization with React.memo.
  apps/desktop/src/components/settings/personalities/PersonalitySection.tsx:
    Created reusable section component with collapsible behavior, sessionStorage
    persistence, and optimized onChange handlers for trait interactions.
  apps/desktop/src/components/settings/personalities/__tests__/DynamicBehaviorSections.test.tsx:
    Created comprehensive unit tests covering 19 test cases including basic
    rendering, trait interactions, collapsible behavior, loading/error states,
    edge cases, and accessibility features. All tests passing.
log: []
schema: v1.0
childrenIds:
  - T-implement-dynamicbehaviorsecti
  - T-integrate-dynamicbehaviorsecti
  - T-load-personality-definitions
  - T-remove-legacy-behaviorsliderss
created: 2025-08-27T05:15:23.921Z
updated: 2025-08-27T05:15:23.921Z
---

# Dynamic Personality Form System

## Overview

Replace the hardcoded personality form components with a dynamic, platform-agnostic form system that renders personality sections and traits passed in from a parent/container (which handles IO). The form must not perform any IO or IPC. It renders sections from provided definitions, treats Big Five like any other section for rendering, and maintains full form functionality.

## Purpose

Create the main DynamicPersonalityForm component that receives personality sections from a parent (renderer container that fetches via IPC to the main process), renders them using the PersonalitySlider component, and provides a unified form experience that replaces the existing hardcoded BigFiveSliders and BehaviorSlidersSection components.

## Key Components to Implement

### DynamicPersonalityForm Component

- Main form component that renders personality sections passed by parent (no IO)
- Consumes preloaded section definitions and a short-description resolver from parent
- Manages form state for all dynamic personality traits
- Provides consistent form validation and submission handling

### Section Rendering System

- Dynamic rendering of personality sections (Big 5, Communication Style, etc.)
- Collapsible sections with persistence of expanded/collapsed state
- Consistent section headers and organization
- Responsive layout for different screen sizes

### Form State Management

- Dynamic form field generation based on JSON trait definitions
- Use React Hook Form Controllers per trait to wire PersonalitySlider as a controlled input
- Proper handling of discrete values in form state (values are DiscreteValue)
- Form dirty state detection for unsaved changes warning
- Initial values: create mode defaults to 40 (unless JSON provides a default); edit mode snaps incoming values to discrete using shared converter

### Legacy Component Replacement

- Replace BigFiveSliders.tsx with dynamic section rendering
- Replace BehaviorSlidersSection.tsx with dynamic section rendering
- Update PersonalityForm.tsx to use new dynamic system
- Maintain existing form submission and validation behavior

## Detailed Acceptance Criteria

### Dynamic Form Rendering

- [ ] Form renders all personality sections provided by parent (derived from `personality_definitions.json`)
- [ ] Big Five treated as normal section (no special hardcoded handling)
- [ ] Form structure adapts automatically when JSON configuration changes
- [ ] Loading states handled gracefully when parent indicates loading
- [ ] Error state displayed when parent indicates failure to load definitions; Save disabled

### Section Organization

- [ ] Each personality section renders with proper header and description
- [ ] Sections maintain collapsible behavior with session persistence
- [ ] Section order follows JSON configuration order
- [ ] Consistent spacing and typography across all sections

### Trait Rendering

- [ ] Each trait within sections renders using PersonalitySlider component
- [ ] Trait IDs from JSON used as form field names
- [ ] Initial values properly mapped from existing personality data (unknown keys ignored)
- [ ] New traits default to 40 if no JSON default provided
- [ ] All trait short descriptions display correctly below sliders

### Form State Integration

- [ ] React Hook Form manages state for dynamically generated fields via Controllers
- [ ] Form validation works with discrete value schema requirements
- [ ] onChange handlers update form state immediately with DiscreteValue
- [ ] Form submission includes all dynamic trait values with correct trait IDs

### Legacy Component Removal

- [ ] BigFiveSliders.tsx component no longer used in PersonalityForm
- [ ] BehaviorSlidersSection.tsx component no longer used in PersonalityForm
- [ ] PersonalityForm.tsx updated to use DynamicPersonalityForm component
- [ ] No hardcoded personality trait references remain in form components

### Data Mapping

- [ ] Existing personality data maps correctly to new trait ID structure; unknown keys ignored
- [ ] Form handles missing trait values with appropriate defaults (40)
- [ ] Submit payload contains a single `behaviors` record with all trait ids (including Big Five)
- [ ] Values are snapped to discrete on load and maintain discrete on change
- [ ] Form submission format matches expected personality data structure

### Form Behavior Preservation

- [ ] Unsaved changes detection works with dynamic fields
- [ ] Form validation prevents submission of invalid discrete values
- [ ] Cancel and save operations work correctly with dynamic form
- [ ] Loading states during form submission handled properly

### Performance Optimization

- [ ] Form renders efficiently with large numbers of personality traits
- [ ] Re-renders minimized when individual trait values change
- [ ] Section collapse/expand operations perform smoothly
- [ ] Initial form load completes within performance requirements

## Implementation Guidance

### Technical Approach

- Container (renderer) fetches definitions via IPC client and passes sections + helpers into the form
- The form must not perform IO/IPC; it only renders and manages form state
- Use React Hook Form Controllers per trait; avoid manual register/onChange wiring
- Leverage React.memo and useCallback to optimize re-renders
- Use error boundaries at the container level for JSON loading failures; form responds to `loading`/`error` props

### Component Architecture

```typescript
import { DiscreteValue } from "@fishbowl-ai/shared/utils/discreteValues";

interface SectionDef {
  id: string;
  name: string;
  description?: string;
  traits: { id: string; label: string }[];
}

interface DynamicPersonalityFormProps {
  sections: SectionDef[]; // provided by parent
  getShort: (traitId: string, value: DiscreteValue) => string | undefined; // provided by parent
  initialData?: PersonalityFormData; // existing personality (edit) or undefined (create)
  onSave: (data: PersonalityFormData) => void;
  onCancel: () => void;
  isLoading?: boolean; // parent indicates loading
  isError?: boolean; // parent indicates error
}

interface PersonalityFormData {
  name: string;
  behaviors: Record<string, DiscreteValue>; // includes Big Five + all other traits
  customInstructions: string;
}
```

### File Structure

```
apps/desktop/src/components/settings/personalities/
├── DynamicPersonalityForm.tsx
├── PersonalitySection.tsx
├── PersonalityForm.tsx (updated)
├── __tests__/
│   ├── DynamicPersonalityForm.test.tsx
│   └── PersonalitySection.test.tsx
└── index.ts (updated exports)

# Removed files:
# ├── BigFiveSliders.tsx (deleted)
# └── BehaviorSlidersSection.tsx (deleted)
```

### State Management Strategy

```typescript
// Use Controller per trait to bind PersonalitySlider as a controlled input
sections.map(section => (
  section.traits.map(trait => (
    <Controller
      key={trait.id}
      name={`traits.${trait.id}`}
      control={form.control}
      rules={{ required: true }}
      render={({ field }) => (
        <PersonalitySlider
          traitId={trait.id}
          label={trait.label}
          value={field.value as DiscreteValue}
          onChange={(v) => field.onChange(v)}
          shortText={getShort(trait.id, field.value as DiscreteValue)}
        />
      )}
    />
  ))
))
```

### Dependencies

- Requires PersonalitySlider component for trait rendering
- Renderer personality definitions client used by parent container (not by the form)
- React Hook Form for dynamic form management
- Existing form validation and submission infrastructure

## Testing Requirements

### Component Integration Tests

- Dynamic form renders correctly with sample JSON configuration
- Form state updates properly when trait values change
- Form validation works with dynamically generated fields
- Submit payload contains a single `behaviors` record with all trait ids
- Legacy components successfully replaced without regression

### Form Behavior Tests

- Form submission includes all dynamic trait values
- Unsaved changes detection works with dynamic fields
- Cancel operation properly resets dynamic form state
- Loading and error states display appropriately (driven by parent props)

<!-- Migration/back-compat tests intentionally omitted: greenfield project -->

### Performance Tests

- Form renders within performance requirements with maximum trait count
- Section expand/collapse operations remain responsive
- Form state updates don't cause excessive re-renders

## Performance Requirements

- [ ] Initial form render completes within 500ms with full trait set
- [ ] Individual trait value changes respond within 50ms
- [ ] Section expand/collapse animations complete within 200ms
- [ ] Form validation runs within 100ms for full form

## Accessibility Requirements

- Form maintains logical tab order for dynamically generated fields
- Section headers properly associated with section content
- Loading states announced to screen readers
- Error states clearly communicated to assistive technology

## Security Considerations

- Validate trait IDs format before registering fields
- Sanitize form data before processing to prevent injection attacks
- Parent is responsible for validating JSON configuration prior to passing sections to the form

<!-- Migration strategy intentionally omitted: greenfield project -->
