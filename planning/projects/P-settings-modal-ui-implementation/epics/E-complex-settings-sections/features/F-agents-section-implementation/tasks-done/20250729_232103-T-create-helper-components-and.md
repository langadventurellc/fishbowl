---
kind: task
id: T-create-helper-components-and
parent: F-agents-section-implementation
status: done
title: Create helper components and utilities for agent forms
priority: normal
prerequisites:
  - T-integrate-agent-form-modals-with
created: "2025-07-29T22:11:25.549260"
updated: "2025-07-29T23:11:23.557746"
schema_version: "1.1"
worktree: null
---

# Create Helper Components and Utilities for Agent Forms

## Context

Create reusable helper components and utilities needed by the `AgentForm` component, including model selection options, configuration description utilities, and form field components. This task extracts common functionality to ensure consistency and maintainability.

**Reference existing patterns:**

- Configuration sliders from Defaults tab in `AgentsSection.tsx` (lines 516-785)
- Utility functions for slider descriptions
- Form field patterns from other settings sections

## Implementation Requirements

### 1. Model Selection Constants

Create `apps/desktop/src/components/settings/constants/models.ts`:

```typescript
export const AVAILABLE_MODELS = [
  {
    value: "Claude 3.5 Sonnet",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  { value: "GPT-4", label: "GPT-4", provider: "OpenAI" },
  { value: "Claude 3 Haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { value: "GPT-3.5 Turbo", label: "GPT-3.5 Turbo", provider: "OpenAI" },
] as const;

export type AvailableModel = (typeof AVAILABLE_MODELS)[number]["value"];
```

### 2. Configuration Description Utilities

Create `apps/desktop/src/components/settings/utils/configDescriptions.ts`:

```typescript
export const getTemperatureDescription = (temperature: number): string => {
  if (temperature < 0.3) return "Very focused and deterministic responses";
  if (temperature < 0.7) return "Balanced creativity and consistency";
  if (temperature < 1.2) return "Creative and varied responses";
  if (temperature < 1.7) return "Highly creative responses";
  return "Maximum creativity and unpredictability";
};

export const getTopPDescription = (topP: number): string => {
  if (topP < 0.3) return "Very focused token selection";
  if (topP < 0.7) return "Balanced token diversity";
  if (topP < 0.9) return "High token diversity";
  return "Maximum token variety";
};

export const getMaxTokensDescription = (maxTokens: number): string => {
  const words = Math.round(maxTokens * 0.75);
  if (maxTokens < 500) return `Short responses (~${words} words)`;
  if (maxTokens < 1500) return `Medium responses (~${words} words)`;
  if (maxTokens < 3000) return `Long responses (~${words} words)`;
  return `Very long responses (~${words} words)`;
};
```

### 3. ConfigurationSlider Component

Create `apps/desktop/src/components/settings/components/ConfigurationSlider.tsx`:

```typescript
import React from "react";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

interface ConfigurationSliderProps {
  label: string;
  value: number;
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  description: string;
  tooltip: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

export const ConfigurationSlider: React.FC<ConfigurationSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  description,
  tooltip,
  formatValue = (v) => v.toString(),
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm font-medium cursor-help">
              {label}
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-sm font-mono font-semibold text-primary">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};
```

### 4. ModelSelect Component

Create `apps/desktop/src/components/settings/components/ModelSelect.tsx`:

```typescript
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { AVAILABLE_MODELS } from "../constants/models";

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            <div className="flex flex-col">
              <span>{model.label}</span>
              <span className="text-xs text-muted-foreground">{model.provider}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### 5. CharacterCounter Component

Create `apps/desktop/src/components/settings/components/CharacterCounter.tsx`:

```typescript
import React from "react";
import { cn } from "../../../lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className,
}) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <span
      className={cn(
        "text-xs",
        isOverLimit
          ? "text-destructive"
          : isNearLimit
          ? "text-warning"
          : "text-muted-foreground",
        className
      )}
    >
      {current}/{max}
    </span>
  );
};
```

### 6. AgentNameInput Component

Create `apps/desktop/src/components/settings/components/AgentNameInput.tsx`:

```typescript
import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { CharacterCounter } from "./CharacterCounter";
import type { AgentCard } from "@fishbowl-ai/shared";

interface AgentNameInputProps {
  value: string;
  onChange: (value: string) => void;
  existingAgents?: AgentCard[];
  currentAgentId?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const AgentNameInput: React.FC<AgentNameInputProps> = ({
  value,
  onChange,
  existingAgents = [],
  currentAgentId,
  disabled = false,
  maxLength = 50,
}) => {
  // Check for duplicate names (excluding current agent in edit mode)
  const isDuplicate = existingAgents.some(
    (agent) =>
      agent.name.toLowerCase() === value.toLowerCase() &&
      agent.id !== currentAgentId
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="agent-name">Agent Name</Label>
        <CharacterCounter current={value.length} max={maxLength} />
      </div>
      <Input
        id="agent-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter agent name..."
        disabled={disabled}
        maxLength={maxLength}
        className={isDuplicate ? "border-destructive" : ""}
      />
      {isDuplicate && (
        <p className="text-xs text-destructive">
          An agent with this name already exists
        </p>
      )}
    </div>
  );
};
```

### 7. Export Helper Components

Create `apps/desktop/src/components/settings/components/index.ts`:

```typescript
export { ConfigurationSlider } from "./ConfigurationSlider";
export { ModelSelect } from "./ModelSelect";
export { CharacterCounter } from "./CharacterCounter";
export { AgentNameInput } from "./AgentNameInput";
```

### 8. Update AgentForm Component

Update the `AgentForm` component to use these helper components for consistency and maintainability.

## Acceptance Criteria

- [ ] Model selection constants defined with realistic AI models
- [ ] Configuration description utilities provide helpful text for different value ranges
- [ ] `ConfigurationSlider` component with tooltip, value display, and description
- [ ] `ModelSelect` component with provider information in dropdown
- [ ] `CharacterCounter` component with color-coded warnings (80%+ yellow, over limit red)
- [ ] `AgentNameInput` component with duplicate name validation
- [ ] All components properly typed with TypeScript interfaces
- [ ] Components follow existing design patterns and styling
- [ ] Helper components are reusable across different form contexts
- [ ] Proper accessibility attributes (labels, descriptions, ARIA)
- [ ] Components integrate seamlessly with shadcn/ui components
- [ ] Description utilities provide contextually appropriate feedback
- [ ] Model selection shows both model name and provider

## Technical Approach

1. **Component extraction**: Create reusable components for common form patterns
2. **Utility functions**: Centralize description logic for consistency
3. **Type safety**: Ensure all components have proper TypeScript interfaces
4. **Design consistency**: Follow existing visual patterns and spacing
5. **Accessibility**: Maintain proper labels and ARIA attributes throughout

## Testing Requirements

Create unit tests covering:

- ConfigurationSlider updates values correctly
- ModelSelect displays options and handles changes
- CharacterCounter shows correct colors at different thresholds
- AgentNameInput validates duplicate names properly
- Description utilities return appropriate text for edge cases
- All components handle disabled states correctly

## Dependencies

- Uses existing shadcn/ui components (Input, Select, Slider, Label, Tooltip)
- Integrates with AgentCard type from shared package
- Uses existing utility functions (cn for class names)
- Compatible with react-hook-form integration patterns

## Security Considerations

- Input validation for character limits
- Duplicate name checking prevents confusion
- Proper HTML attribute handling (maxLength, disabled)
- No direct DOM manipulation or unsafe operations

## Reusability Benefits

These components can be reused in:

- Future agent editing interfaces
- Other configuration forms in the application
- Template creation workflows
- Agent import/export functionality

This task ensures the agent forms have polished, consistent UI components while maintaining code reusability and following established design patterns.

### Log

**2025-07-30T04:21:03.892207Z** - Successfully implemented comprehensive helper components and utilities for agent forms, including model selection constants, configuration description utilities, and reusable form field components. All components integrate seamlessly with shadcn/ui, follow existing design patterns, provide proper accessibility features, and include TypeScript interfaces for type safety. The AgentForm component has been updated to use these helper components for improved consistency and maintainability.

- filesChanged: ["apps/desktop/src/components/settings/constants/models.ts", "apps/desktop/src/components/settings/utils/configDescriptions.ts", "apps/desktop/src/components/settings/components/ConfigurationSlider.tsx", "apps/desktop/src/components/settings/components/ModelSelect.tsx", "apps/desktop/src/components/settings/components/CharacterCounter.tsx", "apps/desktop/src/components/settings/components/AgentNameInput.tsx", "apps/desktop/src/components/settings/components/index.ts", "apps/desktop/src/components/settings/AgentForm.tsx"]
