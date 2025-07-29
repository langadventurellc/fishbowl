---
kind: task
id: T-implement-defaults-tab-with
title: Implement Defaults tab with configuration sliders and inputs
status: open
priority: high
prerequisites:
  - T-create-agentssection-main
created: "2025-07-29T16:17:30.955544"
updated: "2025-07-29T16:17:30.955544"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Implement Defaults Tab with Configuration Sliders and Inputs

## Context

Create the Defaults tab component with interactive configuration controls for agent default settings. This component belongs in the **desktop project** (`apps/desktop/src/`), while shared interfaces belong in the **shared package**.

**Important**: This is UI/UX development only - use local state to demonstrate interactive controls. Focus on polished slider interactions and real-time value updates.

## Implementation Requirements

### 1. Component Creation

Create `apps/desktop/src/components/settings/agents/DefaultsTab.tsx`:

- Temperature slider (0-2) with live value display
- Max Tokens number input with validation styling
- Top P slider (0-1) with precise decimal display
- Reset to defaults button with confirmation
- Real-time preview of setting changes

### 2. Local State Management

Use React useState for immediate UI demonstration:

```typescript
const defaultSettings: AgentDefaults = {
  temperature: 1.0,
  maxTokens: 1000,
  topP: 0.95,
};

const [settings, setSettings] = useState<AgentDefaults>(defaultSettings);
```

### 3. Slider Components

- **Temperature Slider**: Range 0-2, step 0.1, display value (e.g., "1.2")
- **Top P Slider**: Range 0-1, step 0.01, display value (e.g., "0.95")
- Use shadcn/ui Slider component with custom styling
- Live value updates with smooth transitions
- Tooltips explaining each setting's purpose

### 4. Input Components

- **Max Tokens**: Number input with min/max validation
- Input styling consistent with shadcn/ui design
- Error states for invalid values
- Clear visual feedback for value changes

### 5. Interactive Features

- Real-time value updates as user drags sliders
- "Reset to Defaults" button with subtle confirmation
- Setting descriptions with helpful tooltips
- Preview text showing how settings affect behavior
- Smooth animations for all value changes

## Acceptance Criteria

- [ ] Temperature slider works smoothly from 0-2 with 0.1 steps
- [ ] Top P slider provides precise control from 0-1 with 0.01 steps
- [ ] Max Tokens input validates number ranges properly
- [ ] Current values display clearly next to each control
- [ ] "Reset to Defaults" button restores all values
- [ ] Tooltips explain each setting's purpose clearly
- [ ] All controls have smooth, responsive interactions
- [ ] Component is fully responsive across screen sizes
- [ ] Unit tests cover slider interactions and value updates

## Technical Approach

1. Create DefaultsTab component with local state management
2. Implement custom slider components using shadcn/ui Slider
3. Add number input with validation using shadcn/ui Input
4. Create tooltip components for setting explanations
5. Add reset functionality with state restoration
6. Include unit tests for all interactive elements
7. Style using Tailwind classes for consistent spacing
8. Ensure accessibility with proper labels and ARIA attributes

## Setting Descriptions (for tooltips)

- **Temperature (0-2)**: Controls randomness in responses. Lower values (0.1-0.3) are more focused and deterministic, higher values (1.5-2.0) are more creative and varied.
- **Max Tokens**: Maximum length of generated responses. Typical range: 100-4000 tokens.
- **Top P (0-1)**: Controls diversity by limiting token selection. Lower values focus on likely tokens, higher values allow more variety.

## Visual Layout

- Two columns on desktop: sliders left, preview/info right
- Responsive single column for smaller desktop windows
- Label-value pairs clearly associated
- Consistent spacing between controls (space-y-6)
- Visual hierarchy with proper typography
- Reset button positioned prominently but not intrusively

## Preview Functionality

Display example text showing how current settings would affect responses:

- Temperature preview: "With current temperature (1.2), responses will be moderately creative..."
- Token preview: "Responses will be limited to approximately X words..."
- Top P preview: "Token selection will include the top 95% probability tokens..."

## Testing Requirements

- Unit tests for slider value changes and constraints
- Input validation testing for Max Tokens
- Reset functionality testing
- State management testing for all controls
- Accessibility testing for keyboard navigation
- Responsive layout testing across screen sizes

## Dependencies

- Uses shadcn/ui Slider, Input, Button components
- Requires proper TypeScript interfaces from shared package
- Integrates with AgentDefaults interface
- Uses React hooks for state management

### Log
