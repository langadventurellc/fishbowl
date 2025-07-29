---
kind: task
id: T-create-personality-card
parent: F-personalities-section
status: done
title: Create personality card component with Big Five trait display
priority: normal
prerequisites: []
created: "2025-07-28T17:02:04.753410"
updated: "2025-07-28T20:33:53.258220"
schema_version: "1.1"
worktree: null
---

# Create Personality Card Component with Big Five Trait Display

## Context

Create a reusable personality card component for the Saved tab that displays personality information with Big Five trait values in the specified "O:70 C:85 E:40 A:45 N:30" format. This component will be used in a responsive grid layout.

## Implementation Requirements

### Component Structure

Create `PersonalityCard.tsx` in the appropriate desktop UI directory:

```typescript
interface PersonalityCardProps {
  personality: Personality;
  onEdit: (personality: Personality) => void;
  onClone: (personality: Personality) => void;
}
```

### Visual Design Requirements

- Use shadcn/ui Card component as foundation
- Personality name displayed prominently at top
- Big Five traits in compact format: "O:70 C:85 E:40 A:45 N:30"
- Edit and Clone buttons positioned right-aligned at bottom
- Proper spacing (16px) and visual hierarchy
- Hover states with subtle elevation changes (shadow transition)

### Big Five Trait Display

- Format: "O:## C:## E:## A:## N:##" (single letter abbreviations)
- Values displayed as integers (0-100 range)
- Consistent spacing and typography
- Consider color coding for trait ranges (optional enhancement)

### Interactive Elements

- Edit button triggers edit modal/form
- Clone button creates duplicate with "(Copy)" suffix
- Hover effects for better user feedback
- Proper button styling consistent with design system

### Responsive Behavior

- Card adapts to container width
- Maintains readable text sizes
- Buttons remain accessible on mobile
- Proper touch targets for mobile interaction

## Acceptance Criteria

- [ ] Card displays personality name prominently
- [ ] Big Five traits shown in "O:70 C:85 E:40 A:45 N:30" format
- [ ] Edit and Clone buttons positioned consistently (right-aligned)
- [ ] Hover states provide visual feedback with elevation
- [ ] Card maintains proper spacing (16px between cards)
- [ ] Component is fully responsive across screen sizes
- [ ] Buttons trigger appropriate callback functions
- [ ] Component follows established design system patterns

## Testing Requirements

- Unit tests for component rendering with mock personality data
- Test Big Five trait formatting accuracy
- Verify button click handlers fire correctly
- Test responsive behavior across breakpoints
- Accessibility testing for keyboard navigation and screen readers

## Dependencies

- Personality type definitions from T-create-personality-data-types
- shadcn/ui Card, Button components
- Design system styling utilities
- Existing hover/transition patterns

## Security Considerations

- Sanitize personality name display to prevent XSS
- Validate trait values are within expected range before display
- Ensure button actions don't expose sensitive data

## Performance Requirements

- Component renders efficiently in grid layouts
- Hover animations smooth and performant
- Image/icon loading optimized if used
- Minimal re-renders on parent state changes

### Log

**2025-07-29T01:46:04.239037Z** - Successfully created reusable PersonalityCard component with Big Five trait display and proper architecture. Extracted the component from existing SavedPersonalitiesTab implementation, moved all personality-related types to shared package following project conventions, and added comprehensive test coverage. The component displays personality names prominently, shows Big Five traits in the required "O:70 C:85 E:40 A:45 N:30" format, includes properly accessible Edit/Clone buttons, and features hover effects with smooth transitions. All quality checks pass including linting, formatting, and type checking.

- filesChanged: ["packages/shared/src/types/settings/BigFiveTraits.ts", "packages/shared/src/types/settings/PersonalityFormData.ts", "packages/shared/src/types/settings/Personality.ts", "packages/shared/src/types/settings/PersonalityCardProps.ts", "packages/shared/src/types/settings/index.ts", "apps/desktop/src/components/settings/PersonalityCard.tsx", "apps/desktop/src/components/settings/SavedPersonalitiesTab.tsx", "apps/desktop/src/components/settings/PersonalitiesSection.tsx", "apps/desktop/src/components/settings/__tests__/PersonalityCard.test.tsx"]
