---
kind: task
id: T-create-templatecard-component
parent: F-agents-section-implementation
status: done
title: Create TemplateCard component with Use Template button
priority: normal
prerequisites:
  - T-create-agentssection-main
created: "2025-07-29T16:17:06.714018"
updated: "2025-07-29T20:11:01.932748"
schema_version: "1.1"
worktree: null
---

# Create TemplateCard Component with Use Template Button

## Context

Create a reusable TemplateCard component for displaying agent templates with interactive "Use Template" functionality. This component belongs in the **desktop project** (`apps/desktop/src/`), while prop interfaces belong in the **shared package**.

**Important**: This is UI/UX development only - "Use Template" button should be styled and interactive but non-functional as specified. Focus on polished UI interactions.

## Implementation Requirements

### 1. Component Structure

Create `apps/desktop/src/components/settings/agents/TemplateCard.tsx`:

- Reusable card component for template display
- Clean layout with icon, name, description, and action button
- Consistent styling with other card components
- Responsive design for grid layouts

### 2. Shared Types (extend in packages/shared/src/types/)

```typescript
interface TemplateCardProps {
  template: AgentTemplate;
  onUseTemplate?: (templateId: string) => void;
  className?: string;
}
```

### 3. Visual Design

- Use shadcn/ui Card component as base
- Template icon (Lucide React) prominently displayed at top
- Template name as card header with proper typography
- Description text with controlled line height and spacing
- "Use Template" button as primary action at bottom
- Consistent card padding and visual hierarchy

### 4. Interactive Elements

- Card hover state with subtle elevation change
- "Use Template" button with primary styling
- Button hover states with color transitions
- Focus states for keyboard accessibility
- Smooth animations for all state changes

### 5. Content Layout

- Icon centered at top of card
- Name below icon with medium font weight
- Description with text-muted-foreground styling
- Button full width at bottom with proper margin
- Consistent spacing between all elements

## Acceptance Criteria

- [ ] TemplateCard displays template information clearly
- [ ] "Use Template" button is prominently positioned and styled
- [ ] Card has smooth hover state with elevation change
- [ ] Component maintains consistent height in grid layouts
- [ ] All interactive elements have proper focus states
- [ ] Description text handles overflow gracefully
- [ ] Component accepts proper TypeScript props
- [ ] Styling is consistent with design system
- [ ] Unit tests cover rendering and interaction states

## Technical Approach

1. Create TemplateCard component in desktop project
2. Define proper TypeScript interfaces in shared package
3. Use shadcn/ui Card and Button components
4. Implement Lucide React icons for template icons
5. Add Tailwind classes for layout and hover states
6. Include proper accessibility attributes (ARIA labels)
7. Write unit tests for component rendering and props
8. Ensure component works in grid and standalone contexts

## Visual Specifications

- Card dimensions: flexible height, consistent width in grid
- Icon size: 32x32px positioned at top center
- Name typography: text-lg font-medium
- Description: text-sm text-muted-foreground, 2-3 lines max
- Button: full width (w-full) with primary variant
- Padding: p-6 for card content
- Hover state: subtle shadow increase and scale

## Content Guidelines

- Template names: Clear, descriptive (2-4 words)
- Descriptions: Concise, benefit-focused (1-2 sentences)
- Icons: Relevant Lucide React icons that represent template purpose
- Button text: "Use Template" consistently across all cards

## Testing Requirements

- Unit tests for component rendering with various template props
- Hover and focus state behavior verification
- Button interaction testing (styled but non-functional)
- Accessibility testing for screen readers
- Grid layout integration testing

## Dependencies

- Uses shadcn/ui Card and Button components
- Requires Lucide React for template icons
- Integrates with AgentTemplate interface from shared types
- Works with TemplatesTab parent component

### Log

**2025-07-30T01:21:49.417970Z** - Implemented TemplateCard component with Use Template button following vertical layout requirements. Created reusable component that displays template information clearly with centered icon, name, model, description, and full-width primary button. Includes smooth hover animations, accessibility features, and maintains consistent height in grid layouts. All unit tests pass with comprehensive coverage.

- filesChanged: ["packages/shared/src/types/settings/TemplateCardProps.ts", "packages/shared/src/types/settings/index.ts", "apps/desktop/src/components/settings/agents/TemplateCard.tsx", "apps/desktop/src/components/settings/AgentsSection.tsx", "apps/desktop/src/components/settings/agents/__tests__/TemplateCard.test.tsx"]
