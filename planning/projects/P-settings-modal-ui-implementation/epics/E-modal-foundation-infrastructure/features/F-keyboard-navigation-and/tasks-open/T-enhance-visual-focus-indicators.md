---
kind: task
id: T-enhance-visual-focus-indicators
title: Enhance visual focus indicators for keyboard navigation
status: open
priority: normal
prerequisites: []
created: "2025-07-27T11:59:07.561218"
updated: "2025-07-27T11:59:07.561218"
schema_version: "1.1"
parent: F-keyboard-navigation-and
---

# Enhance Visual Focus Indicators for Keyboard Navigation

## Context and Purpose

Enhance the visual focus indicators throughout the settings modal to meet WCAG 2.1 AA contrast requirements and provide clear, consistent focus visibility for keyboard navigation. This ensures users can clearly see which element has keyboard focus at all times.

**Reference**: Feature F-keyboard-navigation-and specifies comprehensive visual focus indicators with 3:1 contrast ratio requirements and 2px minimum width for accessibility compliance.

**Current State**: Existing components have basic focus-visible styles using Tailwind classes, but need enhancement for consistency and compliance.

**Related Components**: All interactive elements in the settings modal, with focus on:

- `apps/desktop/src/components/settings/NavigationItem.tsx`
- `apps/desktop/src/components/settings/SubNavigationTab.tsx`
- `apps/desktop/src/components/settings/ModalHeader.tsx`
- `apps/desktop/src/components/settings/ModalFooter.tsx`

## Technical Implementation

### Create Focus Styles Utility: `apps/desktop/src/styles/focus.ts`

```typescript
// Focus style constants and utilities
export const FOCUS_STYLES = {
  // Base focus ring styles
  ring: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  // High contrast focus ring for critical elements
  highContrast:
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",

  // Focus ring for buttons
  button:
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",

  // Focus ring for navigation items
  navigation:
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",

  // Focus outline for form elements
  form: "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
} as const;

export const getFocusClasses = (
  variant: keyof typeof FOCUS_STYLES,
  disabled?: boolean,
) => {
  if (disabled) return "focus-visible:ring-0";
  return FOCUS_STYLES[variant];
};
```

### Core Enhancement Requirements

- **Consistent Styling**: Standardize focus indicators across all interactive elements
- **Contrast Compliance**: Ensure all focus indicators meet 3:1 contrast ratio
- **Visibility**: 2px minimum width/thickness for focus indicators
- **Theme Support**: Focus indicators work in both light and dark themes
- **Element Types**: Different focus styles for buttons, navigation, forms, etc.
- **Accessibility**: Focus indicators don't obscure content or adjacent elements

## Detailed Acceptance Criteria

### Focus Indicator Standards

- [ ] All focusable elements have visible focus indicators
- [ ] Focus indicators meet 3:1 contrast ratio against background
- [ ] Focus ring minimum 2px thick for visibility
- [ ] Focus indicators work in both light and dark themes
- [ ] Focus style consistency across similar element types
- [ ] Focus indicators don't overlap or obscure element content

### Navigation Focus Enhancement

- [ ] Navigation items have enhanced focus visibility with accent color
- [ ] Active vs focused state clearly differentiated
- [ ] Sub-navigation tabs have appropriate focus indicators
- [ ] Focus indicators update correctly during keyboard navigation
- [ ] Collapsible navigation maintains focus visibility

### Form Element Focus Enhancement

- [ ] Input fields, textareas, selectors have consistent focus styling
- [ ] Form focus indicators don't interfere with validation states
- [ ] Error states maintain focus visibility
- [ ] Disabled elements appropriately handle focus (no focus indicator)

### Button Focus Enhancement

- [ ] All button variants (primary, secondary, ghost) have appropriate focus
- [ ] Icon buttons maintain focus visibility
- [ ] Close button and modal action buttons clearly focusable
- [ ] Focus indicators scale appropriately with button sizes

### Modal-Specific Focus

- [ ] Modal container focus outline for screen readers
- [ ] Modal content focus containment visually clear
- [ ] Tab content switching maintains focus visibility
- [ ] Dynamic content preserves focus indicator styles

## Testing Requirements

### Visual Focus Test File: `apps/desktop/src/components/settings/__tests__/FocusIndicators.visual.test.ts`

**Required Test Cases:**

- [ ] All interactive elements receive focus indicators when focused
- [ ] Focus indicators meet contrast requirements in light theme
- [ ] Focus indicators meet contrast requirements in dark theme
- [ ] Focus indicators have minimum 2px width/thickness
- [ ] Focus indicators don't overflow element boundaries
- [ ] Multiple focus states don't conflict (e.g., hover + focus)
- [ ] Disabled elements don't show focus indicators
- [ ] Focus indicators clear when element loses focus

### Accessibility Test File: `apps/desktop/src/components/settings/__tests__/FocusIndicators.a11y.test.ts`

**Required Test Cases:**

- [ ] axe-core passes for focus indicator contrast
- [ ] Focus indicators detectable by accessibility testing tools
- [ ] Keyboard navigation reveals all focus indicators
- [ ] Focus indicators work with Windows High Contrast mode
- [ ] Focus indicators respect user reduced motion preferences

### Cross-Browser Test File: `apps/desktop/src/components/settings/__tests__/FocusIndicators.cross-browser.test.ts`

**Required Test Cases:**

- [ ] Focus indicators consistent across Chrome, Firefox, Safari, Edge
- [ ] Focus indicators work with browser zoom (100%-200%)
- [ ] Platform-specific focus behavior handled appropriately
- [ ] CSS custom properties work across supported browsers

## Component Enhancement Details

### NavigationItem.tsx Enhancement

```typescript
export function NavigationItem({ active, isFocused, ...props }: NavigationItemProps) {
  return (
    <button
      className={cn(
        // Base styles
        "w-full h-[40px] px-[12px] rounded-[4px] transition-all duration-200",

        // Default state
        "text-muted-foreground hover:bg-accent/30 hover:text-foreground",

        // Active state with enhanced visual distinction
        active && [
          "bg-accent/60 text-accent-foreground",
          "border-l-[3px] border-l-accent", // Left accent border
        ],

        // Enhanced focus indicators
        getFocusClasses('navigation'),
        "focus-visible:outline-none", // Remove default outline

        // High contrast focus for active items
        active && "focus-visible:ring-accent focus-visible:ring-3",

        // Ensure focus doesn't conflict with active styles
        "focus-visible:ring-offset-background",
      )}
      aria-current={active ? "page" : undefined}
      tabIndex={isFocused ? 0 : -1}
      {...props}
    />
  );
}
```

### SubNavigationTab.tsx Enhancement

```typescript
export function SubNavigationTab({ active, ...props }: SubNavigationTabProps) {
  return (
    <button
      className={cn(
        // Base tab styles
        "px-3 py-2 text-sm rounded-md transition-all duration-200",

        // Default state
        "text-muted-foreground hover:text-foreground hover:bg-accent/20",

        // Active tab state
        active && "bg-accent text-accent-foreground",

        // Enhanced focus indicators for tabs
        getFocusClasses('navigation'),
        "focus-visible:outline-none",

        // Tab-specific focus styling
        "focus-visible:ring-offset-1", // Tighter offset for smaller elements
      )}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      {...props}
    />
  );
}
```

### ModalHeader.tsx Enhancement

```typescript
export function ModalHeader({ title }: ModalHeaderProps) {
  return (
    <header className="...">
      <h1>{title}</h1>
      <button
        className={cn(
          // Base close button styles
          "rounded-sm opacity-70 transition-opacity hover:opacity-100",

          // Enhanced focus for critical close button
          getFocusClasses('highContrast'),
          "focus-visible:outline-none",

          // Ensure focus is visible against modal background
          "focus-visible:ring-offset-background",
          "focus-visible:opacity-100", // Ensure button is fully visible when focused
        )}
        aria-label="Close settings modal"
        data-modal-initial-focus // Mark as potential initial focus target
      >
        <XIcon className="w-4 h-4" />
      </button>
    </header>
  );
}
```

## Implementation Guidance

### Focus Design Principles

1. **Consistency**: Use the same focus pattern for similar element types
2. **Contrast**: Ensure focus indicators pass WCAG AA contrast requirements
3. **Clarity**: Focus should be immediately obvious to keyboard users
4. **Non-interference**: Focus indicators shouldn't obscure content
5. **Theme Compatibility**: Work well in both light and dark themes

### CSS Custom Properties for Focus

```css
:root {
  --focus-ring-color: hsl(var(--ring));
  --focus-ring-offset: 2px;
  --focus-ring-width: 2px;
  --focus-ring-style: solid;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --focus-ring-width: 3px;
    --focus-ring-color: hsl(var(--foreground));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .focus-visible\:ring-2 {
    transition: none;
  }
}
```

### Focus State Hierarchy

1. **Primary Elements**: Close button, primary action buttons (3px ring)
2. **Navigation**: Navigation items, tabs (2px ring with accent color)
3. **Forms**: Input fields, selectors (2px ring with form color)
4. **Secondary**: Other interactive elements (2px ring with standard color)

## Performance Considerations

### CSS Optimization

- Use CSS custom properties for consistent theming
- Minimize CSS recalculations during focus changes
- Optimize focus transition animations for 60fps
- Use efficient selectors for focus styles

### JavaScript Integration

- Minimize JavaScript-based focus indicator management
- Use CSS :focus-visible for automatic focus detection
- Cache focus style calculations where needed
- Debounce rapid focus changes if needed

## Accessibility Considerations

### WCAG Compliance

- 3:1 contrast ratio for focus indicators (Level AA)
- 2px minimum thickness for focus outlines
- Focus indicators visible in Windows High Contrast mode
- Support for user focus customization preferences

### User Preferences

- Respect prefers-reduced-motion for focus animations
- Support prefers-contrast for enhanced focus visibility
- Accommodate user custom focus styles where possible
- Ensure focus works with browser accessibility extensions

## Security Considerations

- Ensure focus styles don't reveal sensitive information
- Prevent focus indicator styling from being used for fingerprinting
- Validate any custom focus style inputs for XSS prevention

## Dependencies

- Tailwind CSS configuration for focus utilities
- CSS custom properties support
- Existing component styling architecture
- Jest and React Testing Library for testing

## File Organization

```
apps/desktop/src/styles/
├── focus.ts
└── __tests__/
    └── focus.test.ts

apps/desktop/src/components/settings/
├── NavigationItem.tsx (enhanced)
├── SubNavigationTab.tsx (enhanced)
├── ModalHeader.tsx (enhanced)
├── ModalFooter.tsx (enhanced)
└── __tests__/
    ├── FocusIndicators.visual.test.ts
    ├── FocusIndicators.a11y.test.ts
    └── FocusIndicators.cross-browser.test.ts
```

## Success Metrics

- All focus indicators pass WCAG 2.1 AA contrast requirements
- Focus indicators visible and consistent across all supported browsers
- 100% of interactive elements have visible focus indicators
- axe-core accessibility tests pass for focus indicator contrast
- Manual keyboard navigation testing confirms clear focus visibility
- No performance regressions from enhanced focus styling

### Log
