# Design Token Usage Guide

## Overview

This design token foundation system provides consistent, maintainable design values to replace hardcoded styling throughout the Fishbowl desktop application's settings section. The tokens are organized into logical categories and integrated with the existing Tailwind CSS v4 architecture.

## Token Categories

### Spacing Tokens

Use for consistent spacing throughout the application:

```css
/* Modal dimensions */
.modal {
  width: var(--dt-modal-width-small);
  max-width: var(--dt-modal-max-width);
  height: var(--dt-modal-height-small);
  max-height: var(--dt-modal-max-height);
}

/* Navigation spacing */
.nav-item {
  padding: var(--dt-nav-padding);
  height: var(--dt-nav-item-height);
  padding-left: var(--dt-nav-item-padding-horizontal);
}

/* Content padding */
.content {
  padding: var(--dt-content-padding-desktop);
}

@media (max-width: 800px) {
  .content {
    padding: var(--dt-content-padding-mobile);
  }
}
```

### Typography Tokens

Use for consistent text sizing and weights:

```css
/* Headings */
.heading-primary {
  font-size: var(--dt-heading-primary);
  font-weight: var(--dt-font-weight-title);
}

.heading-secondary {
  font-size: var(--dt-heading-secondary);
  font-weight: var(--dt-font-weight-heading);
}

/* Body text */
.description {
  font-size: var(--dt-text-description);
  font-weight: var(--dt-font-weight-body);
}

.body-text {
  font-size: var(--dt-text-body);
}
```

### Layout Tokens

Use for consistent container and component dimensions:

```css
/* Content constraints */
.content-container {
  max-width: var(--dt-content-max-width);
}

.form-container {
  max-width: var(--dt-form-max-width);
}

/* Component dimensions */
.button {
  min-width: var(--dt-button-min-width);
  height: var(--dt-touch-target-desktop);
}

.preview-card {
  width: var(--dt-preview-card-width);
  height: var(--dt-preview-card-height);
}
```

### Animation Tokens

Use for consistent motion and timing:

```css
/* Individual properties */
.animated-element {
  transition-duration: var(--dt-animation-normal);
  transition-timing-function: var(--dt-easing-smooth);
}

/* Pre-composed transitions */
.hover-effect {
  transition: var(--dt-transition-colors);
}

.transform-effect {
  transition: var(--dt-transition-transform);
}

/* Modal animations */
.modal-enter {
  animation-duration: var(--dt-animation-modal);
  animation-timing-function: var(--dt-easing-enter);
}
```

### Accessibility Tokens

Use for ensuring proper touch targets and focus states:

```css
/* Touch targets */
.button-mobile {
  min-height: var(--dt-touch-min-mobile);
  min-width: var(--dt-touch-min-mobile);
}

.button-desktop {
  min-height: var(--dt-touch-min-desktop);
  min-width: var(--dt-touch-min-desktop);
}

/* Focus rings */
.focusable {
  outline-width: var(--dt-focus-ring-width);
  outline-offset: var(--dt-focus-ring-offset);
}
```

## Tailwind Integration

Design tokens are available as Tailwind utilities through the extended theme configuration:

```html
<!-- Using token-based utilities -->
<div
  class="h-[var(--dt-nav-item-height)] px-[var(--dt-nav-item-padding-horizontal)]"
>
  <h1
    class="text-[var(--dt-heading-primary)] font-[var(--dt-font-weight-title)]"
  >
    Settings
  </h1>
</div>

<!-- Using mapped utilities (where available) -->
<div class="h-nav-item px-nav-item">
  <button class="min-w-[var(--dt-button-min-width)] h-touch-target">
    Save Changes
  </button>
</div>
```

### Responsive Usage

Tokens include responsive considerations:

```html
<!-- Modal with responsive dimensions -->
<div
  class="
  w-[var(--dt-modal-width-small)] 
  h-[var(--dt-modal-height-small)]
  max-w-[var(--dt-modal-max-width)] 
  max-h-[var(--dt-modal-max-height)]
  min-w-[var(--dt-modal-min-width)] 
  min-h-[var(--dt-modal-min-height)]
  max-[800px]:w-[var(--dt-modal-width-medium)]
  max-[800px]:h-[var(--dt-modal-height-mobile)]
"
>
  <!-- Modal content -->
</div>
```

## Token Naming Convention

Tokens follow the pattern: `--dt-[category]-[attribute]-[variant]`

### Categories:

- **Spacing**: `modal`, `nav`, `content`, `button`, `form`, `grid`, `card`
- **Typography**: `heading`, `text`, `font-weight`
- **Layout**: `content`, `form`, `list`, `modal`, `button`, `input`, `preview`
- **Animation**: `animation`, `easing`, `transition`
- **Breakpoint**: `breakpoint`
- **Accessibility**: `touch`, `focus-ring`

### Examples:

- `--dt-modal-width-small` - Small modal width
- `--dt-nav-item-height` - Navigation item height
- `--dt-content-padding-desktop` - Desktop content padding
- `--dt-animation-normal` - Normal animation duration
- `--dt-touch-min-mobile` - Minimum touch target for mobile

## Migration Guidelines

### 1. Identify Hardcoded Values

Look for patterns like:

```css
/* Replace these hardcoded values */
height: 40px;           → height: var(--dt-nav-item-height);
padding: 12px;          → padding: var(--dt-nav-item-padding-horizontal);
width: 80vw;            → width: var(--dt-modal-width-small);
font-size: 18px;        → font-size: var(--dt-heading-secondary);
transition: 200ms;      → transition: var(--dt-transition-all);
```

### 2. Use Semantic Tokens

Prefer semantic meaning over literal values:

```css
/* Good - semantic */
max-width: var(--dt-modal-max-width);
font-size: var(--dt-heading-primary);

/* Avoid - literal */
max-width: var(--dt-1200px);
font-size: var(--dt-24px);
```

### 3. Maintain Responsive Behavior

Ensure tokens preserve responsive design:

```css
/* Before */
.modal {
  width: 80vw;
}
@media (max-width: 800px) {
  .modal {
    width: 95vw;
  }
}

/* After */
.modal {
  width: var(--dt-modal-width-small);
}
@media (max-width: 800px) {
  .modal {
    width: var(--dt-modal-width-medium);
  }
}
```

### 4. Preserve Accessibility

Always use accessibility tokens for interactive elements:

```css
.button {
  min-height: var(--dt-touch-min-desktop);
  outline-width: var(--dt-focus-ring-width);
}

@media (max-width: 800px) {
  .button {
    min-height: var(--dt-touch-min-mobile);
  }
}
```

## Integration with Existing Theme

Design tokens work alongside the existing claymorphism theme:

```css
/* Design tokens + existing theme */
.settings-modal {
  /* Design tokens for layout */
  width: var(--dt-modal-width-small);
  padding: var(--dt-modal-header-padding);

  /* Existing theme for colors */
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
```

## Best Practices

### Do ✅

- Use tokens for all layout dimensions, spacing, and typography
- Follow the semantic naming convention
- Test responsive behavior at key breakpoints
- Maintain accessibility with proper touch targets
- Use token combinations for consistent spacing systems

### Don't ❌

- Mix tokens with hardcoded values in the same component
- Create custom tokens without following the naming convention
- Override token values inline (modify the source instead)
- Use tokens for colors (use existing theme variables)
- Ignore responsive and accessibility considerations

## Testing Tokens

### Verify Token Accessibility

```css
/* Test that tokens are loaded */
.test-element {
  height: var(--dt-nav-item-height, 999px);
  /* If fallback value shows, tokens aren't loaded */
}
```

### Browser DevTools

1. Open DevTools → Elements
2. Select element using tokens
3. Check Computed styles for resolved values
4. Verify tokens change with theme switching

### Responsive Testing

Test token behavior at these breakpoints:

- 799px (Mobile max)
- 800px (Tablet min)
- 999px (Tablet max)
- 1000px (Desktop min)
- 1200px (Wide min)

## Future Considerations

As the design system evolves:

1. **New Categories**: Add new token categories as needed (e.g., `--dt-icon-size-large`)
2. **Scaling**: Maintain consistent scaling relationships between tokens
3. **Documentation**: Update this guide when adding new tokens
4. **Migration**: Plan gradual migration of components to use tokens
5. **Validation**: Consider automated tools to ensure token usage consistency

## Support

For questions about design tokens:

- Check this documentation first
- Review existing usage patterns in components
- Consult the design system team for new token requests
- Follow the established naming conventions for consistency
