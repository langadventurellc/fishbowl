---
kind: task
id: T-create-agentform-component-with
title: Create AgentForm component with comprehensive form fields
status: open
priority: high
prerequisites:
  - T-create-agentformdata-types-and
created: "2025-07-29T22:09:13.722349"
updated: "2025-07-29T22:09:13.722349"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Create AgentForm Component with Comprehensive Form Fields

## Context

Implement the main `AgentForm` component for creating and editing agents, following the established pattern used in `CreateRoleForm.tsx`. This component will handle all form logic, validation, and field rendering using shadcn/ui components and react-hook-form.

**Reference existing patterns:**

- `/apps/desktop/src/components/settings/CreateRoleForm.tsx`
- `/apps/desktop/src/components/settings/FormActions.tsx`

## Implementation Requirements

Create `apps/desktop/src/components/settings/AgentForm.tsx`:

### 1. Component Architecture

```typescript
import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  agentSchema,
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormProps,
} from "@fishbowl-ai/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
```

### 2. Form Fields Implementation

**Name Field:**

- Text input with validation
- Character counter (50 max)
- Unique name validation against existing agents (exclude current in edit mode)

**Model Selection:**

- Dropdown select with available models
- Options: "Claude 3.5 Sonnet", "GPT-4", "Claude 3 Haiku", "GPT-3.5 Turbo"
- Required field validation

**Role Field:**

- Text input with validation
- Character counter (100 max)
- Helper text: "Define the agent's area of expertise and focus"

**Configuration Section:**

- **Temperature Slider**: 0-2 range, 0.1 step, live value display
- **Max Tokens Input**: Number input, 1-4000 range, integer validation
- **Top P Slider**: 0-1 range, 0.01 step, live value display with 2 decimal places
- **System Prompt**: Optional textarea, 4 rows, 500 character limit

### 3. Form State Management

```typescript
const form = useForm<AgentFormData>({
  resolver: zodResolver(agentSchema),
  defaultValues: {
    name:
      initialData?.name ||
      (templateData?.name ? `${templateData.name} Copy` : ""),
    model:
      initialData?.model ||
      templateData?.configuration?.model ||
      "Claude 3.5 Sonnet",
    role:
      initialData?.role ||
      (templateData?.description ? templateData.description.split(".")[0] : ""),
    configuration: {
      temperature:
        initialData?.configuration?.temperature ||
        templateData?.configuration?.temperature ||
        1.0,
      maxTokens:
        initialData?.configuration?.maxTokens ||
        templateData?.configuration?.maxTokens ||
        1000,
      topP:
        initialData?.configuration?.topP ||
        templateData?.configuration?.topP ||
        0.95,
      systemPrompt:
        initialData?.configuration?.systemPrompt ||
        templateData?.configuration?.systemPrompt ||
        "",
    },
  },
  mode: "onChange",
});
```

### 4. Template Mode Handling

When `mode === "template"`:

- Pre-populate form with template data
- Modify agent name to include "Copy" suffix
- Extract role from template description
- Use template configuration as defaults
- Show template source indicator

### 5. Form Actions

```typescript
<div className="flex items-center justify-end gap-3 pt-6 border-t">
  <Button
    type="button"
    variant="ghost"
    onClick={handleCancel}
    disabled={isSubmitting || isLoading}
  >
    Cancel
  </Button>
  <Button
    type="submit"
    disabled={!form.formState.isValid || isSubmitting || isLoading || !form.formState.isDirty}
    className="min-w-[120px]"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Saving...
      </>
    ) : (
      <>{mode === "edit" ? "Update" : mode === "template" ? "Create from Template" : "Create"} Agent</>
    )}
  </Button>
</div>
```

### 6. Configuration Preview Section

Add a collapsible preview section showing how settings affect agent behavior:

```typescript
<div className="space-y-4 p-4 bg-muted/30 rounded-lg">
  <h4 className="text-sm font-medium">Configuration Preview</h4>
  <div className="text-xs space-y-2 text-muted-foreground">
    <div>
      <strong>Temperature ({temperature.toFixed(1)}):</strong> {getTemperatureDescription(temperature)}
    </div>
    <div>
      <strong>Max Tokens ({maxTokens}):</strong> ~{Math.round(maxTokens * 0.75)} words max
    </div>
    <div>
      <strong>Top P ({topP.toFixed(2)}):</strong> {getTopPDescription(topP)}
    </div>
  </div>
</div>
```

## Acceptance Criteria

- [ ] Form component created with all required fields (name, model, role, configuration)
- [ ] Uses shadcn/ui Form components with proper validation
- [ ] Integrates react-hook-form with zodResolver for validation
- [ ] Supports create, edit, and template modes
- [ ] Template mode pre-populates form with template data
- [ ] Name uniqueness validation (excludes current agent in edit mode)
- [ ] Character counters for text fields (name: 50, role: 100, system prompt: 500)
- [ ] Model selection dropdown with realistic options
- [ ] Configuration sliders with live value display and proper ranges
- [ ] System prompt textarea with proper sizing and validation
- [ ] Form actions with proper disabled states and loading indicators
- [ ] Configuration preview section with helpful descriptions
- [ ] Unsaved changes tracking integration
- [ ] Proper accessibility attributes (labels, descriptions, error associations)
- [ ] Form submission handling with error management
- [ ] Cancel confirmation when form has unsaved changes

## Technical Approach

1. **Follow CreateRoleForm pattern**: Use the same structure and validation approach
2. **Reuse slider components**: Extract configuration sliders from DefaultsTab for consistency
3. **Template integration**: Special handling for template mode with pre-population
4. **Field validation**: Use Zod schema with helpful error messages
5. **State integration**: Hook into unsaved changes tracking system
6. **Accessibility**: Proper form labels, descriptions, and error associations

## Testing Requirements

Create unit tests covering:

- Form renders with correct default values
- Template mode populates form correctly
- Validation errors display appropriately
- Form submission calls onSave with correct data
- Cancel button triggers confirmation when form is dirty
- Configuration sliders update values properly
- Model selection updates form state
- Character counters display correctly

## Dependencies

- Requires AgentFormData types and validation schema (previous task)
- Uses existing shadcn/ui components (Form, Input, Select, Slider, Textarea)
- Integrates with useUnsavedChanges hook from shared package
- Uses existing utility functions for descriptions

## Security Considerations

- Form validation prevents XSS through input sanitization
- Character limits prevent buffer overflow attacks
- Numeric validation prevents injection attacks
- Required field validation ensures data integrity

This component forms the core of the agent creation/editing functionality and will be wrapped by the modal component in the next task.

### Log
