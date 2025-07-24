---
kind: task
id: T-create-button-component-with
title: Create Button component with multiple variants
status: open
priority: high
prerequisites: []
created: "2025-07-24T06:52:38.636994"
updated: "2025-07-24T06:52:38.636994"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Create Button Component with Variants

## Context

Extract button components from DesignPrototype.tsx as a unified Button component with multiple variants. This includes send button, context menu items, mode toggles, and sidebar toggle controls from various sections of the design prototype.

## Location in DesignPrototype

- **Send Button**: Lines 422-435 (`sendButton` style)
- **Context Menu Item**: Lines 551-562 (`contextMenuItem` style)
- **Mode Toggle**: Lines 436-456 (`modeToggle`, `modeOption` styles)
- **Sidebar Toggle**: Lines 615-638 (`sidebarToggle` style)

## Implementation Requirements

### 1. File Creation

Create `apps/desktop/src/components/ui/atomic/Button.tsx` with:

```typescript
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: "primary" | "secondary" | "menu-item" | "mode-toggle" | "icon";
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Disabled state */
  disabled?: boolean;
  /** Active state for toggles */
  active?: boolean;
  /** Icon-only button */
  icon?: boolean;
  /** Custom style overrides */
  style?: React.CSSProperties;
  /** Custom CSS class */
  className?: string;
}

// Note: Create ButtonProps interface in packages/shared/src/types/ui/components/
// for future reusability across desktop and mobile platforms
```

### 2. Component Implementation

- Extract and consolidate styling from multiple button patterns in DesignPrototype
- Use CSS custom properties from theme system
- Implement variant-based styling logic
- Support hover states and transitions
- Handle disabled and active states

### 3. Variant Specifications

**Primary (Send Button)**

- Background: `var(--primary)`, Color: `var(--primary-foreground)`
- Border radius: "8px", Padding: varies by size
- Disabled state: opacity 0.5, cursor not-allowed

**Secondary**

- Background: `var(--secondary)`, Color: `var(--secondary-foreground)`
- Border: `1px solid var(--border)`

**Menu Item**

- Background: transparent, Hover: `var(--accent)`
- Padding: "8px 12px", Text align: left
- Transition: "background-color 0.15s"

**Mode Toggle**

- Background: `var(--background)`, Border: `1px solid var(--border)`
- Active state with primary background

**Icon**

- Circular for sidebar toggle, Square for others
- Minimal padding, centered content

### 4. Showcase Integration (CRITICAL)

**Immediately after creating the component:**

- Add Button component to ComponentShowcase page
- Demonstrate all variants with sample content
- Show different sizes for each variant
- Include disabled and active states
- Test hover interactions

### Sample Data for Showcase:

```typescript
const buttonVariants = [
  { variant: "primary", children: "Send Message" },
  { variant: "secondary", children: "Cancel" },
  { variant: "menu-item", children: "Copy message" },
  { variant: "mode-toggle", children: "Manual", active: true },
  { variant: "icon", children: "→" },
];
```

## Acceptance Criteria

- ✅ All button variants render with correct styling
- ✅ Size variants work consistently across all button types
- ✅ Disabled state prevents interaction and shows visual feedback
- ✅ Active state applies correctly for toggles
- ✅ Hover states work with smooth transitions
- ✅ CSS uses theme variables for consistent theming
- ✅ Component under 150 lines of code
- ✅ TypeScript interfaces defined with JSDoc comments
- ✅ **Added to ComponentShowcase with visual verification**
- ✅ Both light and dark themes work correctly
- ✅ No console errors or TypeScript warnings
- ✅ Pixel-perfect match with DesignPrototype appearance

## Dependencies

- F-foundation-typescript-interfaces (create ButtonProps in packages/shared/src/types/ui/components/)

## Testing Requirements

Include unit tests for:

- All variant styling applications
- Size variant combinations
- Disabled and active state handling
- Click handler execution
- Theme variable usage

### Log
