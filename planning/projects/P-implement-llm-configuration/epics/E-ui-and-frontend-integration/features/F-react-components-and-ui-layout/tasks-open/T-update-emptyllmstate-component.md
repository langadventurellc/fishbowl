---
kind: task
id: T-update-emptyllmstate-component
title: Update EmptyLlmState component with comprehensive provider selection
status: open
priority: normal
prerequisites: []
created: "2025-08-07T16:45:28.787464"
updated: "2025-08-07T16:45:28.787464"
schema_version: "1.1"
parent: F-react-components-and-ui-layout
---

# Update EmptyLlmState Component with Comprehensive Provider Selection

## Context

The existing `EmptyLlmState` component needs to be updated to support all provider types (OpenAI, Anthropic, Google, Custom) instead of just OpenAI and Anthropic, and use the shared `Provider` enum.

## Current File Location

**File**: `apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx`

## Detailed Requirements

### Type System Updates

**Props Interface Update**

```typescript
// CURRENT: Limited to two providers
interface EmptyLlmStateProps {
  onSetupProvider: (provider: "openai" | "anthropic") => void;
}

// UPDATE TO: Support all providers
interface EmptyLlmStateProps {
  onSetupProvider: (provider: Provider) => void;
}
```

**Import Updates**

```typescript
import { Provider } from "@fishbowl-ai/shared";
```

### Provider Selection Enhancement

**Provider Options Display**
Instead of just OpenAI and Anthropic, show all 4 providers:

```tsx
const providerOptions = [
  {
    provider: Provider.OPENAI,
    name: "OpenAI",
    description: "GPT-3.5, GPT-4, and other OpenAI models",
    icon: <OpenAIIcon className="w-8 h-8" />,
    color: "green",
    popular: true,
  },
  {
    provider: Provider.ANTHROPIC,
    name: "Anthropic",
    description: "Claude models for helpful, harmless conversations",
    icon: <AnthropicIcon className="w-8 h-8" />,
    color: "orange",
    popular: true,
  },
  {
    provider: Provider.GOOGLE,
    name: "Google AI",
    description: "Gemini models from Google AI Studio",
    icon: <GoogleIcon className="w-8 h-8" />,
    color: "blue",
    popular: false,
  },
  {
    provider: Provider.CUSTOM,
    name: "Custom Provider",
    description: "Connect to any OpenAI-compatible API",
    icon: <CustomIcon className="w-8 h-8" />,
    color: "gray",
    popular: false,
  },
];
```

### Enhanced UI Layout

**Card-Based Provider Selection**

```tsx
<div className="text-center space-y-6">
  <div className="space-y-2">
    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
      <BotIcon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">Set up your first LLM provider</h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      Connect to an AI language model provider to start having conversations
      with AI agents.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
    {providerOptions.map((option) => (
      <ProviderCard
        key={option.provider}
        {...option}
        onClick={() => onSetupProvider(option.provider)}
      />
    ))}
  </div>

  <div className="text-sm text-muted-foreground">
    <p>
      Don't see your preferred provider? Use "Custom Provider" to connect to any
      OpenAI-compatible API.
    </p>
  </div>
</div>
```

### Provider Card Component

**Individual Provider Cards**

```tsx
interface ProviderCardProps {
  provider: Provider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  popular: boolean;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  name,
  description,
  icon,
  color,
  popular,
  onClick,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-${color}-500 relative`}
      onClick={onClick}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-500">Popular</Badge>
      )}
      <CardContent className="p-6 text-center space-y-3">
        <div className="flex justify-center">{icon}</div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Provider-Specific Information

**OpenAI Card**

- Highlight popularity and wide model selection
- Mention GPT-3.5, GPT-4 availability
- Green color scheme matching OpenAI branding

**Anthropic Card**

- Emphasize Claude's conversational abilities
- Mention safety and helpfulness focus
- Orange color scheme matching Anthropic branding

**Google Card**

- Highlight Gemini models and Google integration
- Mention free tier availability in Google AI Studio
- Blue color scheme matching Google branding

**Custom Provider Card**

- Emphasize flexibility and compatibility
- Mention OpenAI-compatible API requirement
- Gray/neutral color scheme
- Add "Advanced" or "Developers" indicator

### Responsive Design

**Layout Adaptations**

```css
/* Mobile: Single column */
@media (max-width: 768px) {
  .provider-grid {
    grid-template-columns: 1fr;
  }
}

/* Desktop: Two columns */
@media (min-width: 769px) {
  .provider-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Card Sizing**

- Consistent card heights regardless of description length
- Proper spacing and padding on all screen sizes
- Touch-friendly targets on mobile devices

### Accessibility Enhancements

**ARIA Labels and Roles**

```tsx
<div role="region" aria-label="LLM Provider Selection">
  <Card
    role="button"
    tabIndex={0}
    aria-label={`Set up ${name} provider - ${description}`}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {/* Card content */}
  </Card>
</div>
```

**Keyboard Navigation**

- All provider cards focusable with tab navigation
- Enter and Space key activation
- Clear focus indicators
- Logical tab order through options

### Visual Design Consistency

**Icon Requirements**

- Consistent 32x32px (w-8 h-8) icon sizing
- SVG format for crisp rendering
- Proper alt text for screen readers
- Color coding that matches provider branding

**Typography**

- Consistent font weights and sizes
- Proper heading hierarchy (h3 for main title, h4 for provider names)
- Readable text contrast ratios
- Responsive text sizing

### Animation and Interactions

**Hover Effects**

```css
.provider-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--provider-color);
}
```

**Click Feedback**

- Subtle scale animation on click
- Visual feedback for touch interactions
- Proper disabled states if needed

### Help and Guidance

**Contextual Help**

- Clear explanation of what each provider offers
- Links to provider documentation where appropriate
- Information about pricing and API key requirements
- Guidance for first-time users

**Getting Started Tips**

```tsx
<div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
  <div className="flex gap-3">
    <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5" />
    <div className="text-sm">
      <h4 className="font-medium text-blue-900">Getting Started</h4>
      <p className="text-blue-700">
        You'll need to obtain an API key from your chosen provider. Don't worry
        - we'll guide you through the setup process.
      </p>
    </div>
  </div>
</div>
```

### Testing Requirements (Include in same task)

Create comprehensive test file: `apps/desktop/src/components/settings/llm-setup/__tests__/EmptyLlmState.test.tsx`

**Test Coverage**

- Component renders with all 4 provider options
- Provider cards are clickable and call onSetupProvider
- Correct provider enum values passed to callback
- Keyboard navigation works properly
- Accessibility attributes present
- Responsive layout on different screen sizes
- Provider-specific information displayed correctly

**Test Implementation**

```typescript
describe('EmptyLlmState', () => {
  const mockOnSetupProvider = jest.fn();

  beforeEach(() => {
    mockOnSetupProvider.mockClear();
  });

  it('renders all provider options', () => {
    render(<EmptyLlmState onSetupProvider={mockOnSetupProvider} />);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Google AI')).toBeInTheDocument();
    expect(screen.getByText('Custom Provider')).toBeInTheDocument();
  });

  it('calls onSetupProvider with correct provider when clicked', () => {
    render(<EmptyLlmState onSetupProvider={mockOnSetupProvider} />);

    fireEvent.click(screen.getByText('OpenAI').closest('div'));
    expect(mockOnSetupProvider).toHaveBeenCalledWith(Provider.OPENAI);
  });

  it('supports keyboard navigation', () => {
    render(<EmptyLlmState onSetupProvider={mockOnSetupProvider} />);

    const openAICard = screen.getByLabelText(/Set up OpenAI provider/);
    openAICard.focus();
    fireEvent.keyDown(openAICard, { key: 'Enter' });

    expect(mockOnSetupProvider).toHaveBeenCalledWith(Provider.OPENAI);
  });
});
```

## Acceptance Criteria

✅ Component supports all 4 provider types (OpenAI, Anthropic, Google, Custom)
✅ Uses `Provider` enum from shared package
✅ Card-based layout with consistent design
✅ Provider-specific icons, descriptions, and branding
✅ Popular providers highlighted appropriately
✅ Responsive design working on mobile and desktop
✅ Full accessibility support with keyboard navigation
✅ Proper ARIA labels and roles
✅ Hover and interaction animations
✅ Contextual help and getting started guidance
✅ Comprehensive unit tests with >90% coverage
✅ Integration with parent component callback
✅ Clean, maintainable code following existing patterns

### Log
