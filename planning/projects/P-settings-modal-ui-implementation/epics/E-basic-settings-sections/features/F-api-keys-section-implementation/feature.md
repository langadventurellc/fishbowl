---
kind: feature
id: F-api-keys-section-implementation
title: API Keys Section Implementation
status: done
priority: normal
prerequisites: []
created: "2025-07-27T16:36:52.087564"
updated: "2025-07-28T15:57:36.718204+00:00"
schema_version: "1.1"
parent: E-basic-settings-sections
---

# API Keys Section Implementation

## Purpose and Goals

Replace the placeholder mockups in the API Keys section with fully functional provider cards featuring password inputs, status indicators, test buttons, and collapsible base URL settings. Implement proper form validation, security practices, and visual feedback for API key management.

## Key Components to Implement

### Provider Cards System

- **OpenAI Provider Card**: Complete implementation with all features
- **Anthropic Provider Card**: Matching structure and functionality
- **Future Provider Support**: Extensible architecture for additional providers
- **Visual Separation**: Clear card-based layout with proper spacing

### Form Components

- **Password Input Fields**: Show/hide toggle functionality with security icons
- **Status Indicators**: Visual feedback with icons and colors
- **Test Buttons**: Non-functional but properly styled action buttons
- **Base URL Fields**: Collapsible advanced settings for each provider

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Section title: "API Keys" with exact 24px font and 20px margin-bottom
- [ ] Section description: "Manage API keys for various AI services and integrations"
- [ ] Provider cards with clear visual separation using borders and spacing
- [ ] Consistent card layout and spacing throughout the section

### Provider Card Structure

Each provider card must include:

- [ ] Card container with proper border, padding, and border-radius
- [ ] Provider name as card header (18px font, semi-bold)
- [ ] API key input field with password masking
- [ ] Show/hide toggle button for API key visibility
- [ ] Status indicator with icon and text
- [ ] Test button with secondary styling
- [ ] Collapsible base URL field (advanced settings)

### OpenAI Provider Card

- [ ] Card header: "OpenAI" with proper typography
- [ ] API key password input:
  - [ ] Masked by default (showing dots/asterisks)
  - [ ] Show/hide toggle button with eye/eye-off icons
  - [ ] Placeholder text: "Enter your OpenAI API key"
  - [ ] Proper label: "API Key"
- [ ] Status indicator:
  - [ ] Green checkmark icon + "Connected" text for valid keys
  - [ ] Red X icon + "Not connected" text for invalid/missing keys
  - [ ] Proper color coding (green for success, red for error)
- [ ] Test button:
  - [ ] Exactly 80px width with secondary styling
  - [ ] Text: "Test"
  - [ ] Non-functional but visually complete
  - [ ] Proper hover and focus states
- [ ] Base URL field:
  - [ ] Label: "Base URL" with collapsible indicator
  - [ ] Collapsed by default with "Advanced" label
  - [ ] Expandable on click to show input field
  - [ ] Default value: "https://api.openai.com/v1"
  - [ ] Proper input validation for URL format

### Anthropic Provider Card

- [ ] Identical structure to OpenAI card
- [ ] Card header: "Anthropic"
- [ ] API key input with same functionality
- [ ] Status indicators with same visual treatment
- [ ] Test button with identical styling
- [ ] Base URL field with default: "https://api.anthropic.com/v1"

### Form Validation and States

- [ ] API key input validation:
  - [ ] Required field validation
  - [ ] Minimum length validation (provider-specific)
  - [ ] Visual error states with red borders
  - [ ] Error messages below invalid inputs
- [ ] Base URL validation:
  - [ ] Valid URL format checking
  - [ ] HTTPS requirement for security
  - [ ] Error states for malformed URLs
- [ ] Form submission prevention with invalid data
- [ ] Loading states for test button interactions (visual only)

### Accessibility Requirements

- [ ] All inputs have proper labels and ARIA attributes
- [ ] Show/hide toggle buttons have descriptive ARIA labels
- [ ] Status indicators use both color and text for accessibility
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible and consistent
- [ ] Screen reader compatibility for all form elements

### Visual Design Specifications

- [ ] Card borders: 1px solid border color with 8px border-radius
- [ ] Card padding: 20px internal padding
- [ ] Card spacing: 16px margin between provider cards
- [ ] Status indicator spacing: 8px gap between icon and text
- [ ] Button sizing: Test buttons exactly 80px width, 36px height
- [ ] Input field styling: Consistent with shadcn/ui Input component
- [ ] Show/hide toggle: 24x24px icon button with hover states

## Implementation Guidance

### Technical Approach

- Use shadcn/ui Input with type="password" for API key fields
- Use shadcn/ui Button for show/hide toggles and test buttons
- Use shadcn/ui Collapsible for expandable base URL sections
- Implement proper password visibility toggle with useState
- Use Lucide React icons for status indicators and toggles
- Implement form validation using Zod schemas

### Component Architecture

```tsx
// Provider card component structure
<ProviderCard provider="openai">
  <CardHeader title="OpenAI" />
  <CardContent>
    <PasswordField
      name="apiKey"
      label="API Key"
      placeholder="Enter your OpenAI API key"
      showToggle={true}
    />
    <StatusIndicator status="connected" />
    <TestButton onClick={handleTest} loading={testing} />
    <CollapsibleField
      label="Base URL (Advanced)"
      name="baseUrl"
      defaultValue="https://api.openai.com/v1"
    />
  </CardContent>
</ProviderCard>
```

### State Management

```tsx
interface ApiKeysState {
  openai: {
    apiKey: string;
    baseUrl: string;
    status: "connected" | "error" | "untested";
    showApiKey: boolean;
    showAdvanced: boolean;
  };
  anthropic: {
    apiKey: string;
    baseUrl: string;
    status: "connected" | "error" | "untested";
    showApiKey: boolean;
    showAdvanced: boolean;
  };
}
```

### Validation Schema

```tsx
const ApiKeysSchema = z.object({
  openai: z.object({
    apiKey: z.string().min(10, "API key too short").optional(),
    baseUrl: z.string().url("Invalid URL format"),
  }),
  anthropic: z.object({
    apiKey: z.string().min(10, "API key too short").optional(),
    baseUrl: z.string().url("Invalid URL format"),
  }),
});
```

## Testing Requirements

### Functional Testing

- [ ] Password visibility toggle works correctly
- [ ] Show/hide button changes input type between password and text
- [ ] Base URL sections expand and collapse properly
- [ ] Form validation prevents invalid submissions
- [ ] Test buttons show proper visual feedback (hover, focus)
- [ ] Status indicators display correct state

### Security Testing

- [ ] API keys are properly masked by default
- [ ] No API key values logged to console
- [ ] Form values are properly secured in state
- [ ] Base URL validation prevents malicious URLs

### Accessibility Testing

- [ ] Screen reader announces input types correctly
- [ ] Show/hide toggles have proper ARIA labels
- [ ] Keyboard navigation works throughout all cards
- [ ] Focus management works correctly
- [ ] Color contrast meets WCAG 2.1 AA standards

### Visual Testing

- [ ] Cards render with exact spacing and layout
- [ ] Status indicators use correct colors and icons
- [ ] Test buttons maintain exact 80px width
- [ ] Responsive behavior works on mobile devices
- [ ] Provider cards stack properly on narrow screens

## Security Considerations

### API Key Handling

- Mask API keys by default with password input type
- Implement secure show/hide toggle functionality
- No logging or console output of API key values
- Proper form field validation and sanitization

### URL Validation

- Enforce HTTPS for base URL fields
- Validate URL format to prevent injection
- Sanitize user input for base URL fields

### State Security

- Secure form state management
- No sensitive data in URL parameters
- Proper cleanup of form state on unmount

## Performance Requirements

- [ ] Provider cards render in under 100ms
- [ ] Show/hide toggle responds within 50ms
- [ ] Collapsible sections animate smoothly (300ms)
- [ ] Form validation feedback appears within 100ms
- [ ] No unnecessary re-renders during state changes

## Dependencies

- shadcn/ui Input, Button, Card components
- shadcn/ui Collapsible for expandable sections
- shadcn/ui Form components for validation
- Lucide React for icons (Eye, EyeOff, Check, X)
- React Hook Form for form state management
- Zod for validation schemas

## Integration Points

- Integrates with SettingsContent component structure
- Uses established card patterns from design system
- Connects to future API key storage and testing functionality
- Follows form validation patterns from other sections
- Maintains consistency with modal accessibility patterns

## Future Extensibility

- Modular provider card system for easy addition of new providers
- Standardized provider configuration interface
- Plugin architecture for custom provider integrations
- Consistent validation and testing patterns across providers

### Log
