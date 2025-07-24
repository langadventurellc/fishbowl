---
kind: feature
id: F-menu-display-components
title: "Menu Display Components"
status: in-progress
priority: normal
prerequisites:
  - F-atomic-ui-components
created: "2025-07-23T19:08:31.716519"
updated: "2025-07-23T19:08:31.716519"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Menu Display Components

## Purpose

Extract UI components related to context menus and dropdown displays, focusing purely on visual representation without any added interactive functionality. These components show the visual structure and styling of menu elements.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### ContextMenuDisplay Component

- **Location in DesignPrototype**: Lines 526-571
- **Purpose**: Visual representation of dropdown context menus
- **Props**: menu items array, position, visibility state, size variant
- **Styling**: Floating menu with shadow, border radius, and backdrop

### MenuItemDisplay Component

- **Purpose**: Individual menu item visual representation
- **Props**: label, icon, disabled state, separator, danger variant
- **Styling**: Menu item with hover states, icon alignment, text styling

### MenuTriggerDisplay Component

- **Purpose**: Visual representation of menu trigger button (ellipsis)
- **Props**: active state, position, size variant, disabled state
- **Styling**: Three-dot button with hover and active states

### MenuContainerDisplay Component

- **Purpose**: Wrapper for positioning and styling menus
- **Props**: position coordinates, z-index, backdrop visibility
- **Styling**: Absolute positioning with proper layering and shadows

### DropdownListDisplay Component

- **Purpose**: List container for menu items
- **Props**: items array, max height, scroll behavior, border styling
- **Styling**: Scrollable list with consistent spacing and borders

## Acceptance Criteria

✅ **Component Structure**

- Each component in `apps/desktop/src/components/menu/` directory
- Display components with no click handlers or added interactions
- Props-based visual configuration and state representation
- TypeScript interfaces for all props from shared package

✅ **Visual Fidelity**

- Exact match with DesignPrototype context menu appearance
- Menu positioning and shadow styling preserved
- All menu item states (normal, hover, disabled, danger) shown
- Proper backdrop and overlay visual effects

✅ **Menu State Display**

- Open/closed menu visual states
- Menu item hover appearance (without actual hover)
- Active menu trigger button styling
- Disabled menu items visual treatment

✅ **Positioning Display**

- Menu positioning relative to trigger elements
- Z-index layering for proper visual stacking
- Backdrop overlay appearance
- Edge-case positioning (viewport boundaries)
- Add to `apps/desktop/src/components/chat/MessageItem.tsx` following the same pattern as the prototype

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each menu component added to ComponentShowcase as it's created
- Different menu configurations and states demonstrated immediately in showcase
- Various positioning scenarios shown

✅ **Code Quality**

- No added interactive functionality
- No event handlers, click logic, or state management
- Pure CSS-in-JS styling with theme variables
- Components under 100 lines each
- TypeScript strict mode compliance

## Implementation Guidance%

**Extraction Process:**

1. Identify context menu visual elements in `apps/desktop/src/pages/DesignPrototype.tsx` (lines 526-571)
2. Extract menu styling objects and positioning logic from DesignPrototype
3. Convert styling to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. Remove all onClick, onToggle, menu interaction handlers
5. Add to `apps/desktop/src/components/chat/MessageItem.tsx` following the same pattern as the prototype
6. Create display components showing menu visual states
7. **Immediately add each component to ComponentShowcase** for visual verification

**Visual States to Support:**

- **ContextMenuDisplay**: visible, hidden, positioned states
- **MenuItemDisplay**: normal, hover, disabled, danger visual states
- **MenuTriggerDisplay**: inactive, active, hover appearance
- **MenuContainerDisplay**: different positioning and backdrop states

(Implement these as named types in TypeScript. See `packages/shared/src/types/ui/core/MessageType.ts` as an example.)

**Styling Focus:**

- Preserve shadow and border radius from design system
- Maintain consistent menu item spacing and typography
- Keep proper z-index layering for overlays
- Use existing theme variables for colors and borders

**File Organization:**

```
apps/desktop/src/components/menu/
├── index.ts (barrel export)
├── ContextMenuDisplay.tsx
├── MenuItemDisplay.tsx
├── MenuTriggerDisplay.tsx
├── MenuContainerDisplay.tsx
└── DropdownListDisplay.tsx
```

## Testing Requirements

- Manual user visual verification of all menu display states
- No added interactive behavior or menu functionality present

## Dependencies

- F-atomic-ui-components (may use Button variants for triggers)
- F-foundation-typescript-interfaces (for menu-related prop types)

### Log
