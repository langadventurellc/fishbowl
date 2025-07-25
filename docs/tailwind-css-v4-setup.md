# Tailwind CSS v4 Setup and Configuration Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Development Patterns](#development-patterns)
4. [Build Process](#build-process)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Topics](#advanced-topics)

---

## Quick Start

### Overview

The Fishbowl project uses **Tailwind CSS v4** with a sophisticated CSS-first architecture that bridges CSS custom properties with Tailwind utilities. The implementation supports both traditional CSS-in-JS patterns and modern Tailwind utilities in a dual approach system.

**Current State**: Tailwind CSS v4 is fully configured and ready to use, but most components currently use CSS-in-JS with CSS custom properties. This enables gradual migration to Tailwind utilities while maintaining visual consistency.

### Key Features

- ✅ **Tailwind CSS v4.1.11** with Vite integration
- ✅ **CSS-first configuration** (no `tailwind.config.js` required)
- ✅ **400+ CSS custom properties** for comprehensive theming
- ✅ **Dual approach** supporting both CSS variables and Tailwind utilities
- ✅ **Complete dark mode** system with `.dark` class
- ✅ **Shared theme package** for monorepo architecture

### Basic Usage Examples

#### Current CSS-in-JS Pattern:

```typescript
// ✅ Currently used throughout codebase
const buttonStyles: React.CSSProperties = {
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  padding: "8px 16px",
  borderRadius: "var(--radius)",
};
```

#### Available Tailwind Utilities:

```tsx
{
  /* ✅ Ready to use - equivalent to above */
}
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius)]">
  Click me
</button>;
```

#### Hybrid Approach:

```tsx
{
  /* ✅ Best of both worlds */
}
<div
  className="flex items-center gap-4 transition-all duration-300"
  style={{ backgroundColor: "var(--background)", padding: dynamicPadding }}
>
  Content
</div>;
```

---

## Architecture Deep Dive

### CSS Layer Organization

The implementation uses Tailwind v4's new layer system for optimal cascade control:

```css
/* packages/ui-theme/src/claymorphism-theme.css */
@import "tailwindcss";

@layer theme, base, components, utilities;
```

**Layer Structure:**

- **`theme`**: Design tokens and CSS custom properties
- **`base`**: Foundation styles and resets
- **`components`**: Component-specific styles
- **`utilities`**: Tailwind utility classes

### CSS Custom Properties System

The architecture includes 400+ CSS custom properties organized into logical groups:

```css
:root {
  /* Color System */
  --background: rgb(231, 229, 228);
  --foreground: rgb(30, 41, 59);
  --primary: rgb(99, 102, 241);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(241, 245, 249);
  --secondary-foreground: rgb(15, 23, 42);

  /* Typography */
  --font-sans: Plus Jakarta Sans, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Roboto Mono, monospace;

  /* Spacing & Layout */
  --radius: 1.25rem;

  /* Claymorphism Design System */
  --shadow-sm:
    2px 2px 10px 4px hsl(240 4% 60% / 0.18),
    2px 1px 2px 3px hsl(240 4% 60% / 0.18);
  --shadow-md:
    6px 6px 18px 6px hsl(240 4% 60% / 0.18),
    3px 3px 8px 4px hsl(240 4% 60% / 0.18);
  /* ... comprehensive shadow system */
}
```

### @theme inline Configuration

Tailwind v4's `@theme inline` directive bridges CSS custom properties with Tailwind utilities:

```css
@theme inline {
  /* Color mapping */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  /* Typography mapping */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  /* Spacing mapping */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

This configuration enables:

```tsx
{/* Both approaches work identically */}
<div style={{ backgroundColor: "var(--primary)" }}>CSS Variables</div>
<div className="bg-primary">Tailwind Utilities</div>
```

### Dark Mode Architecture

Complete dark mode support with CSS custom property overrides:

```css
.dark {
  --background: rgb(30, 27, 24);
  --foreground: rgb(226, 232, 240);
  --primary: rgb(129, 140, 248);
  --secondary: rgb(51, 65, 85);
  /* ... complete theme overrides */
}
```

**Usage:**

```tsx
{
  /* Automatic dark mode support */
}
<html className={isDark ? "dark" : ""}>
  <div className="bg-background text-foreground">
    Respects theme automatically
  </div>
</html>;
```

### Shared Package Architecture

The theme is packaged for monorepo reuse:

```json
// packages/ui-theme/package.json
{
  "name": "@fishbowl-ai/ui-theme",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./claymorphism-theme.css": "./src/claymorphism-theme.css"
  }
}
```

**Import in applications:**

```typescript
// apps/desktop/src/main.tsx
import "@fishbowl-ai/ui-theme/claymorphism-theme.css";
```

---

## Development Patterns

### Current Implementation Patterns

#### CSS-in-JS with CSS Custom Properties

Most components currently use this pattern:

```typescript
// ✅ Current pattern in codebase
const Button: React.FC<ButtonProps> = ({ variant, children }) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "1px solid var(--primary)",
        };
      case "secondary":
        return {
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-foreground)",
          border: "1px solid var(--border)",
        };
      default:
        return {};
    }
  };

  return (
    <button
      style={{
        ...getVariantStyles(),
        padding: "8px 16px",
        borderRadius: "var(--radius)",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
};
```

#### Responsive and Dynamic Styling

```typescript
// ✅ Complex responsive patterns
const SidebarContainer: React.FC<SidebarProps> = ({ collapsed, widthVariant }) => {
  const containerStyles: React.CSSProperties = {
    width: collapsed ? "0px" : getWidthForVariant(widthVariant),
    backgroundColor: "var(--sidebar)",
    borderRight: showBorder ? `1px solid var(--border)` : "none",
    transition: "width 0.3s ease, padding 0.3s ease",
  };

  return <div style={containerStyles}>{children}</div>;
};
```

### Migration Strategies

#### Strategy 1: Gradual Utility Adoption

Replace simple styles with Tailwind utilities while keeping complex logic in CSS-in-JS:

```tsx
// Before
<button style={{
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "var(--primary)"
}}>

// After (Gradual)
<button
  className="px-4 py-2 rounded-lg transition-all duration-200"
  style={{ backgroundColor: "var(--primary)" }}
>
```

#### Strategy 2: Utility-First for New Components

New components should prefer Tailwind utilities:

```tsx
// ✅ Recommended for new components
const NewButton: React.FC<ButtonProps> = ({ variant, children }) => {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground border-primary",
    secondary: "bg-secondary text-secondary-foreground border-border",
  };

  return (
    <button
      className={`
      px-4 py-2 rounded-[var(--radius)] 
      transition-all duration-200 
      border
      ${variantClasses[variant]}
    `}
    >
      {children}
    </button>
  );
};
```

#### Strategy 3: Hybrid Approach for Complex Components

Combine both approaches strategically:

```tsx
// ✅ Best practice for complex components
const MessageItem: React.FC<MessageProps> = ({ message, isActive }) => {
  return (
    <div
      className="flex gap-3 p-4 rounded-lg transition-all duration-300"
      style={{
        backgroundColor: isActive ? "var(--primary-50)" : "var(--background)",
        boxShadow: isActive ? "var(--shadow-md)" : "none",
      }}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{message.agent}</span>
          <span className="text-sm text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        <p className="text-sm text-foreground">{message.content}</p>
      </div>
    </div>
  );
};
```

### When to Use Each Approach

#### Use CSS Custom Properties When:

- ✅ Dynamic values that change based on state/props
- ✅ Complex calculations (`calc()` expressions)
- ✅ Values that need to animate smoothly
- ✅ Theme-dependent colors with opacity variations
- ✅ Component-specific design tokens

#### Use Tailwind Utilities When:

- ✅ Static layout and spacing
- ✅ Common responsive patterns
- ✅ Standard typography and sizing
- ✅ Simple state variants (hover, focus, active)
- ✅ Flexbox and grid layouts

#### Example Decision Matrix:

```tsx
const OptimalComponent = () => {
  return (
    <div
      {/* ✅ Use utilities for static layout */}
      className="flex items-center gap-4 p-6 rounded-lg transition-all duration-300"
      {/* ✅ Use CSS vars for dynamic/theme-dependent values */}
      style={{
        backgroundColor: isActive ? "var(--primary-50)" : "var(--background)",
        boxShadow: elevated ? "var(--shadow-lg)" : "var(--shadow-sm)",
      }}
    >
      {/* ✅ Use utilities for typography */}
      <h3 className="text-lg font-semibold text-foreground">Title</h3>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
  );
};
```

---

## Build Process

### Vite Configuration

The build system uses Tailwind CSS v4's Vite plugin for seamless integration:

```typescript
// apps/desktop/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Simple plugin registration - no config needed
  ],
  // ... other configuration
});
```

**Key Benefits:**

- ✅ **No configuration file required** - Tailwind v4 uses CSS for configuration
- ✅ **Automatic CSS processing** during development and build
- ✅ **Hot Module Replacement** works seamlessly with CSS changes
- ✅ **Optimized production builds** with automatic purging

### Shared Package Dependencies

The theme system relies on the shared package architecture:

```json
// apps/desktop/package.json
{
  "dependencies": {
    "@fishbowl-ai/ui-theme": "workspace:*",
    "@tailwindcss/vite": "^4.1.11",
    "tailwindcss": "^4.1.11"
  }
}
```

**Critical Build Requirement:**

```bash
# ⚠️ REQUIRED: Build shared packages before apps
pnpm build:libs
```

This ensures the `@fishbowl-ai/ui-theme` package is built and available for import.

### Development Workflow

#### Standard Development Process:

```bash
# 1. Install dependencies
pnpm install

# 2. Build shared packages (CRITICAL)
pnpm build:libs

# 3. Start development server
pnpm dev:desktop

# 4. Make changes to CSS theme
# Edit: packages/ui-theme/src/claymorphism-theme.css

# 5. Rebuild shared packages after theme changes
pnpm build:libs

# 6. Changes automatically reload in browser
```

#### Quality Assurance Workflow:

```bash
# Run all quality checks
pnpm quality  # Includes lint, format, type-check

# Run tests
pnpm test

# Build production version
pnpm build:desktop
```

### Monorepo Integration

The implementation leverages Turbo for efficient monorepo builds:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"], // Ensures shared packages build first
      "outputs": ["dist/**"]
    }
  }
}
```

**Dependency Flow:**

```
@fishbowl-ai/ui-theme (shared) → apps/desktop → final build
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Module has no exported member" Errors

**Symptoms:**

```typescript
// Error: Module '"@fishbowl-ai/shared"' has no exported member 'SomeType'
import { SomeType } from "@fishbowl-ai/shared";
```

**Root Cause:** Shared packages haven't been built after type changes.

**Solution:**

```bash
# Build all shared packages
pnpm build:libs

# Or build specific package
cd packages/shared && pnpm build
```

#### 2. CSS Changes Not Reflecting

**Symptoms:**

- Tailwind classes not applying
- CSS custom property changes not visible
- Styles appear cached

**Solutions:**

**Option A: Restart Development Server**

```bash
# Stop dev server (Ctrl+C)
pnpm dev:desktop  # Restart
```

**Option B: Clear Vite Cache**

```bash
# Remove Vite cache
rm -rf apps/desktop/node_modules/.vite
pnpm dev:desktop
```

**Option C: Rebuild Theme Package**

```bash
# If theme changes aren't reflecting
cd packages/ui-theme
pnpm build
cd ../..
pnpm dev:desktop
```

#### 3. Theme Switching Not Working

**Symptoms:**

- Dark mode toggle doesn't change appearance
- CSS custom properties don't update

**Check HTML Class:**

```tsx
// ✅ Ensure dark class is applied correctly
<html className={isDark ? "dark" : ""}>
```

**Verify CSS Custom Properties:**

```css
/* ✅ Ensure dark mode overrides exist */
.dark {
  --background: rgb(30, 27, 24);
  --foreground: rgb(226, 232, 240);
  /* ... other overrides */
}
```

#### 4. Build Process Failures

**Symptoms:**

```bash
Error: Cannot resolve module "@fishbowl-ai/ui-theme/claymorphism-theme.css"
```

**Solution Process:**

```bash
# 1. Clean everything
pnpm clean

# 2. Reinstall dependencies
pnpm install

# 3. Build shared packages first
pnpm build:libs

# 4. Build desktop app
pnpm build:desktop
```

#### 5. Tailwind Utilities Not Working

**Symptoms:**

- Tailwind classes have no effect
- IntelliSense not working

**Check Vite Configuration:**

```typescript
// ✅ Ensure Tailwind plugin is registered
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**Verify CSS Import:**

```typescript
// ✅ Ensure theme CSS is imported in main.tsx
import "@fishbowl-ai/ui-theme/claymorphism-theme.css";
```

#### 6. TypeScript Errors with Tailwind Classes

**Symptoms:**

```typescript
// Error: Type 'string' is not assignable to type 'string'
className = "bg-primary text-primary-foreground";
```

**Solution:**
Ensure Tailwind CSS types are available:

```json
// apps/desktop/tsconfig.json
{
  "compilerOptions": {
    "types": ["node", "vite/client"]
  }
}
```

### Performance Troubleshooting

#### Slow Build Times

**Check Bundle Size:**

```bash
# Analyze bundle composition
pnpm build:desktop
# Review dist/ folder size
```

**Optimize CSS:**

- Tailwind v4 automatically purges unused CSS
- CSS custom properties are optimized during build
- Production builds include minification

#### Memory Issues During Development

**Solutions:**

```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm dev:desktop
```

---

## Advanced Topics

### CSS Layer Management

#### Custom Layer Organization

For complex projects, you can extend the layer system:

```css
@layer theme, base, components, utilities, overrides;

@layer overrides {
  /* High-specificity overrides when needed */
  .important-override {
    background-color: var(--danger) !important;
  }
}
```

#### Component-Specific Layers

```css
@layer components {
  .message-item {
    background-color: var(--background);
    border: 1px solid var(--border);

    &.active {
      background-color: var(--primary-50);
      box-shadow: var(--shadow-md);
    }
  }
}
```

### Performance Optimization

#### CSS Custom Property Optimization

```css
/* ✅ Use efficient CSS custom property patterns */
:root {
  /* Base values */
  --primary-hue: 234;
  --primary-saturation: 89%;

  /* Computed variations */
  --primary: hsl(var(--primary-hue) var(--primary-saturation) 47%);
  --primary-50: hsl(var(--primary-hue) var(--primary-saturation) 97%);
  --primary-100: hsl(var(--primary-hue) var(--primary-saturation) 94%);
}
```

#### Bundle Size Monitoring

```bash
# Check CSS bundle size after changes
pnpm build:desktop
ls -la apps/desktop/dist/assets/*.css
```

### Migration Best Practices

#### Progressive Migration Strategy

1. **Phase 1**: Keep existing CSS-in-JS functional
2. **Phase 2**: Replace simple patterns with Tailwind utilities
3. **Phase 3**: Optimize complex components with hybrid approach
4. **Phase 4**: Standardize patterns and create design system documentation

#### Code Review Guidelines

```tsx
// ✅ Good: Clear separation of concerns
<div
  className="flex items-center gap-4 p-4 rounded-lg transition-all"
  style={{ backgroundColor: dynamicColor }}
>

// ❌ Avoid: Mixing utilities with inline styles for the same property
<div
  className="p-4 bg-primary"
  style={{ padding: "16px", backgroundColor: "var(--secondary)" }}
>
```

### Integration with Design Systems

#### Extending Theme Configuration

```css
@theme inline {
  /* Extend with custom design tokens */
  --color-brand-primary: var(--primary);
  --color-brand-secondary: var(--secondary);

  /* Custom spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

#### Component Variant Patterns

```css
@layer components {
  .button {
    @apply px-4 py-2 rounded-lg transition-all duration-200;

    &.primary {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }

    &.secondary {
      background-color: var(--secondary);
      color: var(--secondary-foreground);
    }
  }
}
```

---

## Conclusion

The Fishbowl Tailwind CSS v4 implementation provides a robust foundation for modern CSS development with:

- **Flexible architecture** supporting both CSS-in-JS and utility-first patterns
- **Comprehensive theming** with 400+ CSS custom properties
- **Efficient build process** with Vite integration
- **Monorepo optimization** through shared packages
- **Future-ready design system** with dark mode and responsive support

The dual approach enables gradual migration while maintaining visual consistency and developer productivity. The sophisticated CSS custom property system ensures theme flexibility while Tailwind utilities provide development efficiency.

For questions or issues not covered in this guide, check the existing component implementations in the codebase or consult the [Tailwind CSS v4 documentation](https://tailwindcss.com/docs).
