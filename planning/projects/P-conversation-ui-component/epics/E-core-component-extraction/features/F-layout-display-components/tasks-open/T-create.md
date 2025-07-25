---
kind: task
id: T-create
title: Create AgentLabelsContainerDisplay layout component
status: open
priority: high
prerequisites:
  - T-create-layout-component-props
created: "2025-07-24T22:07:30.370906"
updated: "2025-07-24T22:07:30.370906"
schema_version: "1.1"
parent: F-layout-display-components
---

# Create AgentLabelsContainerDisplay Layout Component

## Purpose

Extract and create the AgentLabelsContainerDisplay component that provides the horizontal agent labels bar layout, managing the top area that displays active agents with proper spacing, alignment, and theme integration.

## Context

From DesignPrototype analysis, this component corresponds to the agent labels bar structure (lines 313-321) that provides:

- Fixed height bar (`height: "56px"`)
- Horizontal flex layout (`display: "flex", alignItems: "center"`)
- Agent pill spacing (`gap: "8px"`)
- Theme-based background and borders (`backgroundColor: var(--card)`)

## Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` lines 313-321 (styles.agentLabelsBar)
- **Usage Context**: Lines 915-940 showing agent pill rendering and theme toggle
- **Integration**: Houses existing AgentPill components and theme controls

## Technical Approach

### 1. Component Structure

```typescript
// apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx
import React from "react";
import { AgentLabelsContainerDisplayProps } from "@fishbowl-ai/shared";

export const AgentLabelsContainerDisplay: React.FC<
  AgentLabelsContainerDisplayProps
> = ({ children, className, spacing = "normal" }) => {
  // Implementation here
};
```

### 2. Extract Styling from DesignPrototype

- Copy `styles.agentLabelsBar` from DesignPrototype (lines 313-321)
- Convert to component-scoped CSS-in-JS with theme variables
- Maintain fixed height and horizontal layout
- Preserve theme-based styling and borders

### 3. Spacing Variants

- `compact`: Reduced gap for dense layouts
- `normal`: Default 8px gap from DesignPrototype
- `relaxed`: Increased gap for spacious layouts

## Implementation Steps

1. **Create component file** at `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`
2. **Import required dependencies**:
   - React and React.FC
   - AgentLabelsContainerDisplayProps from shared package
3. **Extract agentLabelsBar styles** from DesignPrototype lines 313-321
4. **Implement component logic**:
   - Apply fixed height horizontal container
   - Handle spacing variants (compact/normal/relaxed)
   - Apply theme-based background and borders
   - Render children (AgentPill components) within container
   - Support optional className prop
5. **Add theme integration** with CSS custom properties
6. **Test with existing AgentPill and theme toggle components**
7. **Update LayoutShowcase immediately**:
   - Import AgentLabelsContainerDisplay into LayoutShowcase
   - Replace placeholder agent labels area with AgentLabelsContainerDisplay
   - Add sample AgentPill components and theme toggle to test layout
   - Verify proper spacing variants and theme integration within MainContentPanelDisplay

## Styling Requirements

### Extract from DesignPrototype

```javascript
// From DesignPrototype.tsx lines 313-321
agentLabelsBar: {
  height: "56px",
  backgroundColor: isDark ? "var(--card)" : "var(--card)",
  borderBottom: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  gap: "8px",
}
```

### Component Integration

- Convert to CSS-in-JS within component
- Maintain height: "56px" for consistent header area
- Use theme variables: `var(--card)` and `var(--border)`
- Preserve horizontal flex layout with center alignment
- Keep padding: "0 16px" for consistent edge spacing
- Support spacing variants for gap property

## Acceptance Criteria

✅ **Layout Structure**

- Fixed height (56px) horizontal bar
- Proper flex layout with center alignment
- Consistent edge padding (0 16px)
- Theme-based background and border styling

✅ **Spacing Management**

- Support for compact/normal/relaxed spacing variants
- Default 8px gap matching DesignPrototype
- Proper agent pill alignment and spacing
- Flexible spacing for different use cases

✅ **Component Architecture**

- Uses AgentLabelsContainerDisplayProps from shared package
- Pure layout component with minimal logic
- Proper TypeScript integration
- Support for spacing customization

✅ **Theme Integration**

- Uses CSS custom properties (`var(--card)`, `var(--border)`)
- Proper dark/light theme support
- Consistent with existing theme system
- Maintains visual consistency across themes

## Integration Verification

### Test with Existing Components

- Replace DesignPrototype agentLabelsBar with AgentLabelsContainerDisplay
- Verify AgentPill components render with proper spacing
- Confirm theme toggle positioning and functionality
- Test with various numbers of agent pills

### LayoutShowcase Integration

- Update LayoutShowcase immediately upon component creation
- Replace placeholder agent labels area with AgentLabelsContainerDisplay
- Add sample AgentPill components and theme toggle for demonstration
- Test spacing variants (compact/normal/relaxed) in showcase context
- Verify theme switching behavior and visual consistency
- Validate fixed height (56px) and horizontal layout within MainContentPanelDisplay

## Dependencies

- `T-create-layout-component-props`: Requires AgentLabelsContainerDisplayProps interface
- Existing AgentPill components from `apps/desktop/src/components/chat/`
- Theme system variables from `packages/ui-theme/src/claymorphism-theme.css`
- Future integration within MainContentPanelDisplay

## Notes

- This component provides the top navigation/status bar layout
- Should integrate seamlessly with existing AgentPill components
- Maintains exact visual appearance from DesignPrototype
- Flexible spacing for different layout needs
- Important for consistent agent status display across the interface

### Log
