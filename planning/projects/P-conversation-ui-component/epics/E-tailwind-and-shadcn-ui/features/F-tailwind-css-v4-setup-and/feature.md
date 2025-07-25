---
kind: feature
id: F-tailwind-css-v4-setup-and
title: Tailwind CSS v4 Setup and Configuration
status: done
priority: high
prerequisites: []
created: "2025-07-25T16:47:40.180587"
updated: "2025-07-25T22:58:53.034040+00:00"
schema_version: "1.1"
parent: E-tailwind-and-shadcn-ui
---

# Tailwind CSS v4 Setup and Configuration

## Purpose and Goals

Integrate Tailwind CSS v4 with modern CSS features into the Vite build pipeline, establishing the foundation for CSS-in-JS to Tailwind utility migration. This feature ensures all modern Tailwind v4 capabilities are properly configured including @layer directives, color-mix(), and CSS custom properties integration.

## Key Components to Implement

### Build System Integration

- **Vite Configuration**: Update vite.config.ts to include Tailwind CSS v4 processing
- **PostCSS Setup**: Configure PostCSS for Tailwind processing and optimization
- **Import Statements**: Update main.tsx to import Tailwind CSS instead of existing theme CSS
- **Build Pipeline**: Ensure Tailwind CSS is properly purged and optimized for production

### Theme Configuration Migration

- **CSS Custom Properties Mapping**: Convert existing claymorphism-theme.css variables to Tailwind v4 theme configuration
- **Design Token Parity**: Ensure new Tailwind theme produces identical visual output to current CSS custom properties
- **Color System**: Migrate color definitions using Tailwind v4's improved color-mix() and @theme inline features
- **Typography & Spacing**: Map existing font and spacing variables to Tailwind's theme system

### Modern CSS Feature Implementation

- **@layer Directive**: Implement proper cascade layers (theme, base, components, utilities)
- **@theme inline**: Use Tailwind v4's @theme inline for direct variable access
- **color-mix() Support**: Leverage modern color-mix() functions for opacity variations
- **@property Integration**: Implement registered custom properties for advanced theming

## Detailed Acceptance Criteria

### Build Integration Requirements

✅ **Tailwind v4 Installation**: Latest Tailwind CSS v4 installed with npm install tailwindcss@latest  
✅ **Vite Configuration**: Tailwind CSS processes correctly in Vite build pipeline with zero build errors  
✅ **PostCSS Integration**: PostCSS properly configured for Tailwind processing and optimization  
✅ **Import Updates**: main.tsx imports Tailwind CSS instead of @fishbowl-ai/ui-theme/claymorphism-theme.css  
✅ **Hot Reload**: Development server hot reload works efficiently with Tailwind CSS changes  
✅ **Build Optimization**: Production builds include properly purged and optimized Tailwind CSS

### Theme Configuration Requirements

✅ **Variable Mapping**: All CSS custom properties from claymorphism-theme.css mapped to Tailwind theme  
✅ **Color Parity**: Tailwind color system produces identical colors to existing CSS variables  
✅ **Typography Consistency**: Font families (Plus Jakarta Sans, Lora, Roboto Mono) properly configured  
✅ **Spacing System**: Existing spacing values preserved in Tailwind theme configuration  
✅ **Shadow System**: Custom shadow values (--shadow-xs, --shadow-sm, etc.) integrated into Tailwind  
✅ **Radius Values**: Border radius values (--radius: 1.25rem) properly configured

### Modern CSS Feature Requirements

✅ **Layer Organization**: Proper @layer theme, base, components, utilities cascade implemented  
✅ **Theme Inline**: @theme inline properly configured for direct CSS variable access  
✅ **Color Mix Integration**: color-mix() functions working for opacity and transparency effects  
✅ **Property Registration**: @property directives for gradient and animation variables  
✅ **Dark Mode Support**: .dark class system properly integrated with Tailwind's dark: prefix  
✅ **Variable Access**: Both var(--color-primary) and Tailwind utilities working simultaneously

### Development Experience Requirements

✅ **IntelliSense**: Tailwind CSS IntelliSense working in VSCode with proper autocomplete  
✅ **Type Safety**: TypeScript integration maintains type safety for component props  
✅ **Performance**: Build times remain reasonable with Tailwind processing  
✅ **Error Handling**: Clear error messages for Tailwind configuration issues  
✅ **Documentation**: Updated development documentation for new Tailwind setup

## Implementation Guidance

### Technical Approach

- **Use Tailwind CSS v4.0+** with latest features and modern CSS integration
- **Preserve existing CSS variables** during transition to enable gradual migration
- **Implement @theme inline** for seamless integration between CSS variables and Tailwind utilities
- **Configure proper cascade layers** following Tailwind v4 best practices
- **Maintain backwards compatibility** with existing component styling during migration

### Configuration Strategy

- **Empty tailwind.config** for Tailwind v4 (leave config path blank in components.json)
- **CSS-first configuration** using @theme inline in global CSS file
- **Proper color wrapping** using hsl() wrappers for CSS variables
- **Layer organization** following @layer theme, base, components, utilities pattern

### Integration Patterns

- **Dual system support** - CSS variables and Tailwind utilities work simultaneously
- **Progressive migration** - components can be migrated incrementally
- **Theme consistency** - existing light/dark mode system preserved
- **Build optimization** - proper purging and tree-shaking configured

## Testing Requirements

### Configuration Testing

- **Build process** completes successfully with Tailwind v4 integration
- **All existing components** render without visual changes
- **Dark mode toggle** continues to work identically
- **Hot reload** responds correctly to Tailwind utility changes
- **Production builds** generate optimized CSS with proper purging

### Visual Regression Testing

- **Screenshot comparison** of all component showcase pages
- **Theme switching** maintains identical visual appearance
- **Typography rendering** remains pixel-perfect identical
- **Color accuracy** verified across all theme variations
- **Shadow and border radius** effects preserved exactly

### Performance Testing

- **Bundle size** remains equivalent or smaller than CSS-in-JS approach
- **Build time** impact is minimal (under 10% increase)
- **Runtime performance** shows no degradation
- **Development server** startup time unaffected

## Security Considerations

### Build Security

- **Dependency validation** - only install verified Tailwind CSS v4 packages
- **Configuration validation** - validate all Tailwind configuration values
- **Asset security** - ensure Tailwind processing doesn't expose sensitive information
- **Build isolation** - Tailwind processing isolated from application code

### Content Security Policy

- **CSS generation** compatible with existing Electron CSP rules
- **Inline styles** handled appropriately for CSP compliance
- **Asset loading** works with current security restrictions

## Performance Requirements

### Build Performance

- **Build time impact** less than 10% increase over current CSS-in-JS approach
- **Hot reload speed** maintains sub-500ms response time
- **Memory usage** during development remains reasonable
- **CPU usage** for Tailwind processing optimized

### Runtime Performance

- **CSS bundle size** equal or smaller than current approach
- **Parse time** for CSS optimized for fast loading
- **Render performance** maintains current frame rates
- **Memory footprint** of CSS system reduced or equivalent

## Dependencies and Integration

### Package Dependencies

- **tailwindcss@latest** (v4.0+) as primary dependency
- **@tailwindcss/vite@latest** for Vite integration
- **postcss@latest** for CSS processing
- **autoprefixer@latest** for browser compatibility

### Build System Integration

- **Vite configuration** updated for Tailwind processing
- **TypeScript** integration maintained for type safety
- **Electron compatibility** ensured for desktop app requirements
- **Development workflow** preserved with enhanced capabilities

This feature establishes the foundation for all subsequent CSS-in-JS to Tailwind migration work, ensuring modern Tailwind v4 capabilities are fully leveraged while maintaining perfect compatibility with existing systems.

### Log
