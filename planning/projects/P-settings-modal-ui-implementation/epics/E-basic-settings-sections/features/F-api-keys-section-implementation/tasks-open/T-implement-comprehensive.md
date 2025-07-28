---
kind: task
id: T-implement-comprehensive
title: Implement comprehensive accessibility features and ARIA support
status: open
priority: normal
prerequisites:
  - T-add-form-validation-with-error
created: "2025-07-27T22:24:37.577664"
updated: "2025-07-27T22:24:37.577664"
schema_version: "1.1"
parent: F-api-keys-section-implementation
---

# Implement Comprehensive Accessibility Features

## Context

Ensure the API Keys section meets WCAG 2.1 AA accessibility standards with proper ARIA attributes, keyboard navigation, screen reader support, and color contrast requirements.

## Implementation Requirements

### ARIA Attributes and Labels

Enhance all interactive elements with proper accessibility attributes:

```tsx
// API Key Input Field
<Input
  type={showApiKey ? "text" : "password"}
  value={apiKey}
  onChange={(e) => onApiKeyChange(e.target.value)}
  placeholder={provider.apiKeyValidation.placeholder}
  aria-label={`${provider.name} API key`}
  aria-describedby={`${provider.id}-apikey-description ${provider.id}-apikey-error`}
  aria-invalid={!!errors?.apiKey}
  aria-required="false"
/>

// Show/Hide Toggle Button
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={onToggleApiKey}
  aria-label={showApiKey ? `Hide ${provider.name} API key` : `Show ${provider.name} API key`}
  aria-pressed={showApiKey}
  aria-controls={`${provider.id}-apikey-input`}
>
  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</Button>
```

### Screen Reader Announcements

Implement live region announcements for dynamic content:

```tsx
// Status Change Announcements
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {status === "connected" && `${provider.name} API key test successful`}
  {status === "error" && `${provider.name} API key test failed`}
</div>

// Validation Error Announcements
<div
  id={`${provider.id}-apikey-error`}
  aria-live="assertive"
  className="sr-only"
>
  {errors?.apiKey}
</div>
```

### Keyboard Navigation Support

Ensure all interactive elements are keyboard accessible:

#### Tab Order Management

```tsx
// Provider Card Container
<div
  className="border rounded-lg p-5"
  role="group"
  aria-labelledby={`${provider.id}-heading`}
>
  <h3 id={`${provider.id}-heading`} className="text-lg font-semibold mb-4">
    {provider.name}
  </h3>
  // Proper tab order: API key input → show/hide toggle → test button → advanced
  toggle → base URL
</div>
```

#### Keyboard Event Handling

```tsx
const handleKeyDown = (event: React.KeyboardEvent) => {
  // Enter/Space for button activation
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    // Handle button activation
  }

  // Escape to close collapsible sections
  if (event.key === "Escape" && showAdvanced) {
    setShowAdvanced(false);
  }
};
```

### Focus Management

Implement proper focus handling for dynamic content:

```tsx
const advancedRef = useRef<HTMLDivElement>(null);

const handleToggleAdvanced = () => {
  onToggleAdvanced();

  // Focus management when opening advanced section
  if (!showAdvanced) {
    setTimeout(() => {
      advancedRef.current?.querySelector("input")?.focus();
    }, 100);
  }
};
```

### Status Indicator Accessibility

Make status indicators accessible to screen readers:

```tsx
const StatusIndicator: React.FC<{ status: string; provider: string }> = ({
  status,
  provider,
}) => {
  const getStatusContent = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Check className="h-4 w-4 text-green-600" aria-hidden="true" />,
          text: "Connected",
          className: "text-green-600",
          ariaLabel: `${provider} API key is connected`,
        };
      case "error":
        return {
          icon: <X className="h-4 w-4 text-red-600" aria-hidden="true" />,
          text: "Not connected",
          className: "text-red-600",
          ariaLabel: `${provider} API key connection failed`,
        };
      default:
        return {
          icon: <X className="h-4 w-4 text-gray-400" aria-hidden="true" />,
          text: "Not connected",
          className: "text-gray-400",
          ariaLabel: `${provider} API key not tested`,
        };
    }
  };

  const { icon, text, className, ariaLabel } = getStatusContent();

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};
```

### Color Contrast and Visual Design

Ensure all visual elements meet WCAG AA contrast requirements:

#### Color Combinations

- **Success (Connected)**: Green text/icons with sufficient contrast ratio (≥4.5:1)
- **Error States**: Red text/icons with sufficient contrast ratio (≥4.5:1)
- **Default/Inactive**: Gray with sufficient contrast against background
- **Focus Indicators**: High contrast visible focus rings

#### Alternative Visual Cues

- **Status Icons**: Use both color and iconography (checkmark vs X)
- **Error States**: Use border color, icon, and text together
- **Required Fields**: Use asterisk (\*) in addition to color coding

### Collapsible Section Accessibility

Implement proper accessibility for expandable content:

```tsx
<Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
  <CollapsibleTrigger asChild>
    <Button
      variant="ghost"
      className="flex items-center gap-2 p-0 h-auto"
      aria-expanded={showAdvanced}
      aria-controls={`${provider.id}-advanced-content`}
      id={`${provider.id}-advanced-trigger`}
    >
      <span>Base URL (Advanced)</span>
      {showAdvanced ? (
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  </CollapsibleTrigger>

  <CollapsibleContent
    id={`${provider.id}-advanced-content`}
    aria-labelledby={`${provider.id}-advanced-trigger`}
  >
    <div className="mt-2">
      <Label htmlFor={`${provider.id}-baseurl`}>Base URL</Label>
      <Input
        id={`${provider.id}-baseurl`}
        type="url"
        value={baseUrl}
        onChange={(e) => onBaseUrlChange(e.target.value)}
        aria-describedby={`${provider.id}-baseurl-description ${provider.id}-baseurl-error`}
        aria-invalid={!!errors?.baseUrl}
      />
    </div>
  </CollapsibleContent>
</Collapsible>
```

### Form Descriptions and Help Text

Add descriptive content for screen readers:

```tsx
// Hidden descriptions for context
<div id={`${provider.id}-apikey-description`} className="sr-only">
  Enter your {provider.name} API key to enable integration.
  This key will be used to authenticate requests to {provider.name} services.
</div>

<div id={`${provider.id}-baseurl-description`} className="sr-only">
  Advanced setting: Custom base URL for {provider.name} API endpoints.
  Leave as default unless you're using a custom proxy or enterprise setup.
</div>
```

### Acceptance Criteria

- [ ] All interactive elements have proper ARIA labels and descriptions
- [ ] Show/hide toggle buttons announce current state to screen readers
- [ ] Status indicators use both color and text for accessibility
- [ ] Keyboard navigation works for all interactive elements in logical tab order
- [ ] Focus indicators are visible and high contrast (≥3:1 ratio)
- [ ] Error messages are properly associated with form inputs via aria-describedby
- [ ] Live regions announce status changes and validation errors
- [ ] Collapsible sections properly manage focus and announce state changes
- [ ] All text meets WCAG AA color contrast requirements (≥4.5:1)
- [ ] Component works correctly with screen readers (tested with NVDA/JAWS)
- [ ] Form validation errors are announced immediately when they occur
- [ ] Component supports Windows High Contrast Mode

### Testing Requirements

- **Screen Reader Testing**: Verify compatibility with NVDA, JAWS, and VoiceOver
- **Keyboard Navigation**: Test complete keyboard-only interaction flow
- **Color Contrast**: Verify all color combinations meet WCAG AA standards
- **Focus Management**: Ensure logical focus order and visible focus indicators
- **High Contrast Mode**: Test appearance in Windows High Contrast Mode

### Dependencies

- Existing ProviderCard and form validation components
- Screen reader testing tools or accessibility testing framework
- Color contrast analyzers for verification

### Log
