---
kind: task
id: T-create-providercard-base
title: Create ProviderCard base component with shared form elements
status: open
priority: high
prerequisites: []
created: "2025-07-27T22:22:38.347805"
updated: "2025-07-27T22:22:38.347805"
schema_version: "1.1"
parent: F-api-keys-section-implementation
---

# Create ProviderCard Base Component

## Context

The API Keys section needs a flexible ProviderCard component that can render different AI providers (OpenAI, Anthropic, etc.) with consistent UI patterns. This base component will handle the shared form elements and layout structure.

## Implementation Requirements

### Component Structure

Create a new file: `apps/desktop/src/components/settings/api-keys/ProviderCard.tsx`

### Core Features

- **Card Layout**: Use shadcn/ui Card component with proper borders, padding, and spacing
- **Provider Header**: Display provider name with 18px font-size and semi-bold weight
- **Password Input Field**: Use shadcn/ui Input with type="password" and show/hide toggle
- **Status Indicator**: Icon + text display with proper color coding
- **Test Button**: Secondary styled button with exact 80px width
- **Collapsible Base URL**: Advanced settings that expand/collapse on click

### Technical Implementation

```tsx
interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    defaultBaseUrl: string;
  };
  apiKey: string;
  baseUrl: string;
  status: "connected" | "error" | "untested";
  showApiKey: boolean;
  showAdvanced: boolean;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onToggleApiKey: () => void;
  onToggleAdvanced: () => void;
  onTest: () => void;
}
```

### Required Components to Use

- `Card`, `CardHeader`, `CardContent` from shadcn/ui
- `Input` with password type functionality
- `Button` for show/hide toggle and test button
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` for base URL
- Lucide React icons: `Eye`, `EyeOff`, `Check`, `X`, `ChevronDown`, `ChevronRight`

### Acceptance Criteria

- [ ] Card renders with 1px border, 8px border-radius, 20px padding
- [ ] Provider header displays with proper typography (18px, semi-bold)
- [ ] API key input masks password by default with show/hide toggle functionality
- [ ] Status indicator shows icon + text with proper color coding (green for connected, red for error)
- [ ] Test button is exactly 80px wide with secondary styling and hover states
- [ ] Base URL section is collapsible with "Advanced" label and proper animations
- [ ] All form elements have proper labels and ARIA attributes for accessibility
- [ ] Component accepts provider configuration object for flexibility
- [ ] Unit tests verify all interactive functionality works correctly

### Dependencies

- shadcn/ui Card, Input, Button, Collapsible components
- Lucide React for icons
- React useState for internal state management

### Security Considerations

- API key values are properly masked by default
- No console logging of sensitive form values
- Proper input sanitization for base URL validation

### Log
