---
kind: feature
id: F-input-display-components
title: Input Display Components
status: in-progress
priority: normal
prerequisites:
  - F-atomic-ui-components
created: "2025-07-23T19:07:55.426115"
updated: "2025-07-23T19:07:55.426115"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Input Display Components

## Purpose

Extract UI components related to the message input area, focusing purely on visual display without any interactive functionality. These components show the visual structure and styling of input elements.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### MessageInputDisplay Component

- **Location in DesignPrototype**: Lines 397-456 (InputArea section)
- **Purpose**: Visual representation of message input textarea
- **Props**: placeholder text, current content, disabled state, size variant
- **Styling**: Auto-resize styling, border focus states, theme integration

### SendButtonDisplay Component

- **Purpose**: Visual representation of the send button
- **Props**: disabled state, loading state, variant (enabled/disabled)
- **Styling**: Primary button styling with consistent theming

### ModeToggleDisplay Component

- **Purpose**: Visual representation of Manual/Auto mode toggle
- **Props**: current mode, disabled state, size variant
- **Styling**: Toggle switch with mode labels and state indicators

### InputContainerDisplay Component

- **Purpose**: Layout wrapper for input area components
- **Props**: layout variant, spacing, border styling
- **Styling**: Flex layout with proper spacing and responsive behavior

### TextareaDisplay Component

- **Purpose**: Styled textarea visual representation
- **Props**: content, placeholder, rows, resize behavior
- **Styling**: Custom textarea styling matching design system

## Acceptance Criteria

✅ **Component Structure**

- Each component in `apps/desktop/src/components/ui/input/` directory
- Pure display components with no event handling
- Props-based styling and content display
- TypeScript interfaces for all props from shared package

✅ **Visual Fidelity**

- Exact match with DesignPrototype input area appearance
- All visual states preserved (focused, disabled, active)
- Auto-resize styling behavior maintained visually
- Consistent border radius and spacing from design system

✅ **State Display**

- Disabled state visual representation
- Loading/sending state visual indicators
- Focus state styling (without actual focus behavior)
- Mode toggle state visualization (Manual/Auto)

✅ **Layout Preservation**

- Proper component spacing and alignment
- Responsive behavior maintained
- Flex layout and grid positioning preserved
- Z-index and layering preserved

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each input component added to ComponentShowcase as it's created
- Different states and variants demonstrated immediately in showcase
- Both light and dark theme compatibility tested in showcase
- Multiple content scenarios shown in showcase
- Sample input data created for realistic previews

✅ **Code Quality**

- No functional input handling (display only)
- No event listeners or state management
- Pure CSS-in-JS styling with theme variables
- Components under 100 lines each
- TypeScript strict mode compliance

## Implementation Guidance

**Extraction Process:**

1. Identify input-related visual elements in `apps/desktop/src/pages/DesignPrototype.tsx` (lines 397-456)
2. Extract styling objects for textarea, buttons, containers from DesignPrototype
3. Convert styling to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. Remove all onChange, onClick, onSubmit handlers
5. Create pure display components showing visual states
6. **Immediately add each component to ComponentShowcase** for visual verification

**Visual States to Support:**

- **MessageInputDisplay**: empty, with content, disabled, focused appearance
- **SendButtonDisplay**: enabled, disabled, loading visual states
- **ModeToggleDisplay**: manual mode, auto mode visual states
- **TextareaDisplay**: different content lengths, placeholder states

**Styling Focus:**

- Preserve auto-resize visual appearance
- Maintain border and focus state styling
- Keep consistent spacing and layout
- Use existing theme variables for colors

**File Organization:**

```
apps/desktop/src/components/ui/input/
├── index.ts (barrel export)
├── MessageInputDisplay.tsx
├── SendButtonDisplay.tsx
├── ModeToggleDisplay.tsx
├── InputContainerDisplay.tsx
└── TextareaDisplay.tsx
```

## Testing Requirements

- Visual verification of all display states
- Theme switching preserves all styling
- Different content lengths display correctly
- All visual states render without errors
- No interactive functionality present

## Dependencies

- F-atomic-ui-components (may use Button variants)
- F-foundation-typescript-interfaces (for input-related prop types)

### Log
