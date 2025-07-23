---
kind: task
id: T-create-layoutshowcase-page-for
title: Create LayoutShowcase page for full-screen layout component demonstration
status: open
priority: normal
prerequisites:
  - T-create-shared-layout-component
created: "2025-07-23T17:18:31.285269"
updated: "2025-07-23T17:18:31.285269"
schema_version: "1.1"
parent: F-component-showcase-page
---

# Create LayoutShowcase Page

## Context

Create the layout component showcase page accessible via `#/showcase/layout`. This page demonstrates full-screen layout components showing how major page components work together (sidebar + main content window integration).

## Technical Approach

Build a full-screen layout demonstration page following existing codebase patterns:

1. **Full-screen layout demo**: Show realistic screen layout with sidebar and main content areas
2. **Layout integration**: Demonstrate how components work together in realistic screen layout
3. **Manual addition pattern**: Clear approach for developers to add page-level layout components
4. **Theme responsiveness**: All layout elements respond correctly to theme changes

## Implementation Requirements

### File to Create

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx`

### Component Structure

```typescript
export function LayoutShowcase() {
  // Full-screen layout demonstration
  // Sample data for layout components
  // Integration patterns for major layout components
}
```

### Layout Demonstration Focus

Following the feature specification, demonstrate:

1. **Sidebar Component**: Collapsible navigation and conversation management
2. **Main Content Window**: Primary content area with message display
3. **Layout Integration**: How components work together in realistic screen layout
4. **Responsive Behavior**: How layout adapts to different window sizes

### Manual Addition Pattern Implementation

Create clear patterns for developers to add layout components:

```typescript
// Example pattern for layout components:
import { Sidebar } from '../../components/layout/Sidebar';
import { MainPanel } from '../../components/layout/MainPanel';

// Sample data for realistic integration
const sidebarProps = {
  // Sample sidebar data
};

const mainPanelProps = {
  // Sample main panel data
};

// Demonstrate realistic integration with sample data
<div className="app-layout">
  <Sidebar {...sidebarProps} />
  <MainPanel {...mainPanelProps} />
</div>
```

### Layout Integration Requirements

1. **Full-screen demonstration**: Show components at actual screen size
2. **Realistic data**: Use sample data that demonstrates actual usage patterns
3. **Interactive elements**: Show how layout components interact with each other
4. **Responsive design**: Demonstrate layout behavior at different screen sizes

## Acceptance Criteria

- ✅ LayoutShowcase page renders without errors at `#/showcase/layout`
- ✅ Full-screen layout displays with sidebar and main content areas
- ✅ Page integrates correctly with ShowcaseLayout (theme toggle, navigation)
- ✅ Layout demonstrates realistic component integration patterns
- ✅ Manual addition pattern is documented and clear for page-level components
- ✅ Layout adapts appropriately to different window sizes
- ✅ Theme changes from layout apply correctly to all demonstration elements
- ✅ Page loads quickly and integrates with hot reload
- ✅ TypeScript compilation succeeds without errors

## Layout and Visual Requirements

- **Full-screen layout demo**: Show actual screen layout with integrated components
- **Realistic integration**: Demonstrate how layout components work together
- **Responsive design**: Layout adapts to different window sizes appropriately
- **Theme consistency**: Uses existing CSS custom properties system
- **Visual hierarchy**: Clear demonstration of layout component relationships

## Manual Addition Guidelines

### Layout Component Addition Pattern

```typescript
// 1. Import layout components
import { NewLayoutComponent } from '../../components/layout/NewLayoutComponent';
import { RelatedComponent } from '../../components/layout/RelatedComponent';

// 2. Define sample data for realistic demonstration
const layoutData = {
  // Sample data that shows realistic usage
  // Demonstrate component interactions
  // Include sample content and state
};

// 3. Add to layout demonstration with realistic integration
<div className="layout-demo">
  <NewLayoutComponent {...layoutData}>
    <RelatedComponent />
  </NewLayoutComponent>
</div>
```

### Sample Data Guidelines for Layout Components

- **Realistic integration data**: Sample data shows how components work together
- **Interactive demonstrations**: Include state and behavior samples
- **Full-context examples**: Show components with realistic content and interactions
- **Documentation**: Comments explaining layout integration patterns

## Layout Component Categories

1. **Page-Level Components**: Full-screen demonstration of major layout components
   - **Sidebar Component**: Collapsible navigation and conversation management
   - **Main Content Window**: Primary content area with message display
   - **Layout Integration**: How components work together in realistic screen layout

## Styling Requirements

- **Full-screen layout**: Use available space to show realistic layout proportions
- **CSS-in-JS approach**: Follow existing patterns from DesignPrototype
- **Theme-aware styling**: All layout elements respond to light/dark theme changes
- **Layout consistency**: Maintain existing app layout patterns and proportions

## Testing Requirements

- Manual testing of full-screen layout rendering
- Verify layout components display in realistic proportions
- Test theme toggle functionality affects all layout elements
- Verify navigation to/from page works correctly
- Test responsive behavior across different window sizes
- Verify sample layout component addition pattern works as documented

## Dependencies

- Requires ShowcaseLayout component to be completed
- React Router HashRouter setup must be working
- Access to existing CSS custom properties from theme system

## Security Considerations

- No dynamic component loading - all layout components manually imported
- No external data sources or API calls from showcase
- No sensitive data exposure through sample layout data

## Documentation Requirements

Include clear comments in the file explaining:

- How to add new layout components for demonstration
- Sample data patterns for layout integration
- Layout integration best practices and examples

### Log
