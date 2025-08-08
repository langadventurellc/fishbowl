---
kind: task
id: T-update-llmprovidercard-component
parent: F-react-components-and-ui-layout
status: done
title:
  Update LlmProviderCard component with enhanced provider support and secure
  display
priority: normal
prerequisites:
  - T-create-usellmconfig-react-hook
created: "2025-08-07T16:44:03.740364"
updated: "2025-08-07T20:45:41.194251"
schema_version: "1.1"
worktree: null
---

# Update LlmProviderCard Component with Enhanced Provider Support

## Context

The existing `LlmProviderCard` component needs to be updated to support all provider types (OpenAI, Anthropic, Google, Custom) and use the proper shared types instead of local types. It also needs enhanced security features for API key display.

## Current File Location

**File**: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

## Detailed Requirements

### Type System Updates

**Props Interface Update**

```typescript
// CURRENT: Uses custom type
interface LlmProviderCardProps {
  api: LlmProviderConfig; // Custom local type
  onEdit: () => void;
  onDelete: () => void;
}

// UPDATE TO: Use shared types
interface LlmProviderCardProps {
  configuration: LlmConfigMetadata; // From @fishbowl-ai/shared
  onEdit: (config: LlmConfigMetadata) => void;
  onDelete: (configId: string) => void;
}
```

**Import Updates**

```typescript
// ADD imports from shared package:
import type { LlmConfigMetadata, Provider } from "@fishbowl-ai/shared";
```

### Provider Support Enhancement

**Provider Icons and Labels**

- **OpenAI**: Existing OpenAI icon and branding
- **Anthropic**: Existing Anthropic icon and branding
- **Google**: Add Google/Gemini icon and "Google AI" label
- **Custom**: Add generic custom provider icon and "Custom Provider" label

**Provider Display Logic**

```typescript
const getProviderInfo = (provider: Provider) => {
  switch (provider) {
    case Provider.OPENAI:
      return { icon: <OpenAIIcon />, label: "OpenAI", color: "green" };
    case Provider.ANTHROPIC:
      return { icon: <AnthropicIcon />, label: "Anthropic", color: "orange" };
    case Provider.GOOGLE:
      return { icon: <GoogleIcon />, label: "Google AI", color: "blue" };
    case Provider.CUSTOM:
      return { icon: <CustomIcon />, label: "Custom Provider", color: "gray" };
    default:
      return { icon: <GenericIcon />, label: "Unknown", color: "gray" };
  }
};
```

### Security Enhancements

**API Key Masking**

- Never display actual API keys in the card
- Show masked format: `sk-...****1234` (first 3 chars + "..." + last 4 chars)
- Use proper masking for all provider key formats:
  - OpenAI: `sk-...****1234`
  - Anthropic: `sk-ant-...****5678`
  - Google: `AIza...****abcd`
  - Custom: `****...****1234`

**Secure Display Helper**

```typescript
const maskApiKey = (provider: Provider): string => {
  // Never show actual API key - just show masked placeholder
  switch (provider) {
    case Provider.OPENAI:
      return "sk-...****";
    case Provider.ANTHROPIC:
      return "sk-ant-...****";
    case Provider.GOOGLE:
      return "AIza...****";
    case Provider.CUSTOM:
      return "****...****";
    default:
      return "****";
  }
};
```

### Visual Design Updates

**Provider-Specific Styling**

- Color-coded borders/accents based on provider
- Consistent card layout for all provider types
- Provider-specific icons with appropriate sizing
- Clear visual hierarchy: custom name → provider type → masked key

**Status Indicators**

- Show configuration status (active, error, etc.)
- Display last updated timestamp in friendly format
- Show baseUrl for custom providers only
- Indicate auth header usage with small badge

**Card Layout Structure**

```tsx
<Card className={`provider-card provider-${provider.toLowerCase()}`}>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {providerIcon}
        <div>
          <h3 className="font-semibold">{configuration.customName}</h3>
          <p className="text-sm text-muted-foreground">{providerLabel}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onEdit(configuration)}>Edit</Button>
        <Button
          variant="destructive"
          onClick={() => onDelete(configuration.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="text-sm">
        <span className="text-muted-foreground">API Key: </span>
        <code className="bg-muted px-2 py-1 rounded">{maskedApiKey}</code>
      </div>
      {provider === Provider.CUSTOM && configuration.baseUrl && (
        <div className="text-sm">
          <span className="text-muted-foreground">Base URL: </span>
          <code className="bg-muted px-2 py-1 rounded">
            {configuration.baseUrl}
          </code>
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Updated {formatDistanceToNow(new Date(configuration.updatedAt))} ago
      </div>
    </div>
  </CardContent>
</Card>
```

### Custom Provider Enhancements

**Additional Information Display**

- Show baseUrl prominently for custom providers
- Display auth header configuration
- Provide visual indicators for custom setup
- Show helpful tooltips for custom configurations

**Custom Provider Validation Indicators**

- Visual indication if baseUrl is missing (shouldn't happen but good UX)
- Show configuration completeness status
- Indicate any setup issues visually

### Accessibility Improvements

**ARIA Labels and Descriptions**

```tsx
<Card
  role="article"
  aria-label={`LLM configuration for ${configuration.customName} using ${providerLabel}`}
>
  <Button
    onClick={() => onEdit(configuration)}
    aria-label={`Edit ${configuration.customName} configuration`}
  >
    Edit
  </Button>
  <Button
    onClick={() => onDelete(configuration.id)}
    aria-label={`Delete ${configuration.customName} configuration`}
  >
    Delete
  </Button>
</Card>
```

**Keyboard Navigation**

- Ensure proper tab order through card elements
- Support keyboard activation for edit/delete buttons
- Provide clear focus indicators
- Screen reader friendly content structure

### Performance Optimizations

**React.memo Implementation**

```typescript
export const LlmProviderCard = React.memo<LlmProviderCardProps>(
  ({ configuration, onEdit, onDelete }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return (
      prevProps.configuration.id === nextProps.configuration.id &&
      prevProps.configuration.updatedAt === nextProps.configuration.updatedAt
    );
  },
);
```

**Optimized Re-renders**

- Use React.memo to prevent unnecessary re-renders
- Memoize expensive provider info calculations
- Optimize icon rendering with proper keys

### Testing Requirements (Include in same task)

Create comprehensive test file: `apps/desktop/src/components/settings/llm-setup/__tests__/LlmProviderCard.test.tsx`

**Test Coverage**

- Rendering for all 4 provider types
- Proper API key masking for each provider
- Custom provider baseUrl display
- Edit and delete button functionality
- Accessibility attributes presence
- Provider-specific styling and icons
- Timestamp formatting
- React.memo optimization working

**Test Cases**

```typescript
describe("LlmProviderCard", () => {
  it("renders OpenAI configuration correctly", () => {});
  it("renders Anthropic configuration correctly", () => {});
  it("renders Google configuration correctly", () => {});
  it("renders Custom configuration with baseUrl", () => {});
  it("masks API keys securely", () => {});
  it("calls onEdit with correct configuration", () => {});
  it("calls onDelete with correct ID", () => {});
  it("displays timestamp correctly", () => {});
});
```

### Icon Requirements

**Provider Icons Needed**

- Ensure OpenAI icon exists (likely already implemented)
- Ensure Anthropic icon exists (likely already implemented)
- Add Google/Gemini icon (may need to be created/imported)
- Add generic custom provider icon (gear/settings icon)

**Icon Specifications**

- Consistent sizing: 24x24px or 1.5rem
- Proper alt text for accessibility
- SVG format preferred for scalability
- Consistent style with existing app icons

## Acceptance Criteria

✅ Component uses `LlmConfigMetadata` type from shared package
✅ Supports all 4 provider types with proper icons and labels
✅ API keys are properly masked and never exposed
✅ Custom providers show baseUrl and additional configuration
✅ Provider-specific styling and color coding implemented
✅ Proper accessibility attributes and keyboard navigation
✅ React.memo optimization for performance
✅ Comprehensive unit tests with >90% coverage
✅ Clean, maintainable code following existing patterns
✅ Security compliant with no sensitive data exposure
✅ Responsive design working on all screen sizes
✅ Integration with parent component callbacks working properly

### Log

**2025-08-08T01:56:58.660484Z** - Successfully updated LlmProviderCard component with comprehensive provider support, enhanced security, and full accessibility compliance.

## Key Improvements Implemented

### Type System & Architecture

- Migrated from custom local types to shared `LlmConfigMetadata` type from `@fishbowl-ai/shared`
- Updated props interface to pass configuration objects directly and callbacks with proper parameters
- Simplified parent component integration in LlmSetupSection

### Enhanced Provider Support

- Added full support for all 4 provider types: OpenAI, Anthropic, Google AI, and Custom
- Implemented provider-specific icons using lucide-react: Sparkles (OpenAI), Brain (Anthropic), Globe (Google), Settings (Custom)
- Added provider-specific color coding with dark mode support
- Enhanced visual distinction between provider types

### Security Features

- Implemented secure API key masking with provider-specific formats:
  - OpenAI: "sk-...\*\*\*\*"
  - Anthropic: "sk-ant-...\*\*\*\*"
  - Google: "AIza...\*\*\*\*"
  - Custom: "\***\*...\*\***"
- Ensures API keys are never exposed in UI, maintaining security compliance
- Added proper security validation in comprehensive test suite

### Custom Provider Enhancements

- Conditional display of baseUrl for custom providers with proper styling
- Shows authorization header usage indicators
- Handles long URLs with break-all CSS for proper layout
- Graceful handling of missing optional fields

### User Experience Improvements

- Added relative timestamp formatting ("2 hours ago", "just now", etc.)
- Improved card layout with better information hierarchy
- Added hover effects and smooth transitions
- Enhanced visual feedback with provider-specific styling

### Accessibility Compliance

- Proper ARIA labels for screen readers
- Semantic HTML structure with article roles and heading levels
- Keyboard navigation support
- Focus management and screen reader compatibility
- Comprehensive accessibility test coverage

### Performance Optimization

- Implemented React.memo with custom comparison function
- Optimized re-renders by memoizing expensive calculations
- Efficient provider info and timestamp formatting
- Prevents unnecessary re-renders when props unchanged

### Comprehensive Testing

- Created 31 comprehensive unit tests covering all features
- Tests for all 4 provider types and their specific behaviors
- Security testing to ensure API keys never exposed
- Accessibility testing for ARIA compliance
- Performance testing for React.memo optimization
- Edge case testing for long strings and missing fields
- Fixed existing test mocks to work with new interface
- All 712 tests now passing (38/38 test suites)
- filesChanged: ["apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx", "apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx", "apps/desktop/src/components/settings/llm-setup/__tests__/LlmProviderCard.test.tsx", "apps/desktop/src/components/settings/llm-setup/__tests__/LlmSetupSection.test.tsx"]
