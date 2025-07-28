---
kind: task
id: T-add-responsive-design-and-mobile
title: Add responsive design and mobile optimization
status: open
priority: low
prerequisites:
  - T-implement-api-keys-main-section
created: "2025-07-27T22:25:20.670831"
updated: "2025-07-27T22:25:20.670831"
schema_version: "1.1"
parent: F-api-keys-section-implementation
---

# Add Responsive Design and Mobile Optimization

## Context

Ensure the API Keys section works seamlessly across all device sizes with proper responsive behavior, touch-friendly interactions, and optimal mobile user experience.

## Implementation Requirements

### Responsive Provider Card Layout

Update ProviderCard component with responsive design patterns:

```tsx
// Provider Card Container - Responsive padding and spacing
<Card className="w-full border border-border rounded-lg">
  <CardContent className="p-4 sm:p-5 md:p-6">
    {/* Provider Header - Responsive typography */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base sm:text-lg font-semibold">{provider.name}</h3>
    </div>

    {/* Form Fields - Responsive spacing */}
    <div className="space-y-3 sm:space-y-4">
      {/* API Key Field - Mobile-optimized input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">API Key</Label>
        <div className="relative">
          <Input
            className="pr-10 text-sm sm:text-base"
            // Mobile-friendly placeholder
            placeholder={
              isMobile ? "Enter API key" : provider.apiKeyValidation.placeholder
            }
          />
          {/* Touch-friendly toggle button */}
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8"
            size="sm"
            variant="ghost"
          >
            {showApiKey ? (
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

### Mobile-First Responsive Breakpoints

Implement responsive behavior using Tailwind CSS breakpoints:

#### Mobile (< 640px)

- **Card Padding**: 16px internal padding
- **Font Sizes**: Smaller text for compact display
- **Button Sizes**: Larger touch targets (44px minimum)
- **Spacing**: Reduced gaps between elements
- **Input Height**: Standard mobile input heights

#### Tablet (640px - 1024px)

- **Card Padding**: 20px internal padding
- **Button Layout**: Maintain proper spacing
- **Input Sizing**: Standard desktop input sizes
- **Typography**: Increase to standard sizes

#### Desktop (1024px+)

- **Card Padding**: 24px internal padding
- **Full Typography**: All text at specified sizes
- **Optimal Spacing**: All margins and padding at full size

### Touch-Friendly Interactive Elements

Ensure all interactive elements meet touch accessibility guidelines:

```tsx
// Test Button - Touch-optimized sizing
<Button
  variant="secondary"
  className="w-20 h-9 sm:w-[80px] sm:h-10 text-xs sm:text-sm"
  onClick={onTest}
>
  Test
</Button>

// Show/Hide Toggle - Minimum 44px touch target
<Button
  variant="ghost"
  size="sm"
  className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
  onClick={onToggleApiKey}
>
  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</Button>
```

### Mobile-Optimized Form Inputs

Enhance form inputs for mobile devices:

```tsx
// API Key Input with mobile considerations
<Input
  type={showApiKey ? "text" : "password"}
  value={apiKey}
  onChange={(e) => onApiKeyChange(e.target.value)}
  className="text-base sm:text-sm" // Prevent zoom on iOS
  autoComplete="off"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck="false"
  // Mobile-specific attributes
  inputMode="text"
  placeholder={isMobile ? "Enter API key" : provider.apiKeyValidation.placeholder}
/>

// Base URL Input with URL keyboard
<Input
  type="url"
  value={baseUrl}
  onChange={(e) => onBaseUrlChange(e.target.value)}
  className="text-base sm:text-sm"
  inputMode="url" // Show URL keyboard on mobile
  autoComplete="url"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck="false"
/>
```

### Responsive Status Indicators

Adapt status indicators for different screen sizes:

```tsx
const StatusIndicator: React.FC<{ status: string; isMobile?: boolean }> = ({
  status,
  isMobile = false,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {status === "connected" ? (
        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      ) : (
        <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
      )}
      <span className="text-xs sm:text-sm">
        {status === "connected" ? "Connected" : "Not connected"}
      </span>
    </div>
  );
};
```

### Collapsible Section Mobile Behavior

Optimize collapsible advanced sections for mobile:

```tsx
<Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
  <CollapsibleTrigger asChild>
    <Button
      variant="ghost"
      className="flex items-center gap-2 p-2 sm:p-1 h-auto min-h-[44px] sm:min-h-auto"
    >
      <span className="text-sm sm:text-base">Base URL (Advanced)</span>
      {showAdvanced ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  </CollapsibleTrigger>

  <CollapsibleContent>
    <div className="mt-3 sm:mt-2 space-y-2">
      <Label className="text-sm">Base URL</Label>
      <Input
        type="url"
        value={baseUrl}
        onChange={(e) => onBaseUrlChange(e.target.value)}
        className="text-base sm:text-sm"
        inputMode="url"
      />
    </div>
  </CollapsibleContent>
</Collapsible>
```

### Mobile Device Detection

Add device detection utility for conditional behavior:

```tsx
import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};
```

### Error Message Responsive Display

Ensure error messages display properly on mobile:

```tsx
const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;

  return (
    <p
      className="text-xs sm:text-sm text-destructive mt-1 break-words"
      role="alert"
    >
      {message}
    </p>
  );
};
```

### Container and Layout Responsiveness

Update main section container for responsive behavior:

```tsx
export const ApiKeysSettings: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">API Keys</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage API keys for various AI services and integrations
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {Object.values(PROVIDERS).map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            // ... other props
          />
        ))}
      </div>
    </div>
  );
};
```

### Acceptance Criteria

- [ ] Provider cards stack properly on mobile devices with appropriate spacing
- [ ] All interactive elements have minimum 44px touch targets on mobile
- [ ] Font sizes scale appropriately across breakpoints (mobile: smaller, desktop: full)
- [ ] Input fields use appropriate mobile keyboards (URL keyboard for base URL)
- [ ] iOS text inputs use text-base size to prevent automatic zoom
- [ ] Card padding adjusts responsively (16px mobile, 20px tablet, 24px desktop)
- [ ] Status indicators scale icons and text appropriately for screen size
- [ ] Collapsible sections maintain proper touch targets and spacing
- [ ] Error messages wrap properly and remain readable on narrow screens
- [ ] Section title and description scale appropriately across devices
- [ ] Component maintains usability on screens as narrow as 320px
- [ ] Unit tests verify responsive behavior across different viewport sizes

### Testing Requirements

- **Device Testing**: Test on actual mobile devices (iOS Safari, Android Chrome)
- **Viewport Testing**: Test across various viewport sizes (320px to 1920px)
- **Touch Testing**: Verify all interactive elements work with touch input
- **Orientation Testing**: Test both portrait and landscape orientations
- **Zoom Testing**: Ensure usability at 200% zoom level

### Performance Considerations

- **Responsive Images**: Optimize icon sizes for different screen densities
- **Touch Debouncing**: Prevent accidental double-taps on mobile
- **Smooth Animations**: Ensure collapsible sections animate smoothly on all devices

### Dependencies

- Tailwind CSS responsive utilities
- React hooks for device detection
- Existing ProviderCard and form components
- Mobile testing environment or browser dev tools

### Log
