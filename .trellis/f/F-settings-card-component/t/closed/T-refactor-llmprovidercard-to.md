---
id: T-refactor-llmprovidercard-to
title: Replace LlmProviderCard with SettingsCard implementation
status: done
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles:
  apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx:
    Completely replaced complex 178-line implementation with simplified 37-line
    SettingsCard-based version - removed maskApiKey and formatRelativeTime
    helper functions, eliminated complex Card layout with API key display and
    timestamps, simplified getProviderInfo to return only labels, integrated
    with SettingsCard component for consistent styling and interaction patterns
log:
  - >-
    Successfully replaced the complex LlmProviderCard implementation with a
    simplified SettingsCard-based version. The refactoring reduced the component
    from 178 lines to 37 lines by:


    1. **Complete Implementation Replacement**: Deleted entire complex Card
    layout with multiple sections, API key masking, timestamp formatting, and
    authorization header display

    2. **Removed All Helper Functions**: Eliminated maskApiKey,
    formatRelativeTime functions and complex useMemo hooks

    3. **Simplified Content Display**: Now shows only provider label
    (OpenAI/Anthropic) instead of detailed configuration information

    4. **Maintained Interface Compatibility**: Preserved LlmProviderCardProps
    interface ensuring no breaking changes to LlmSetupSection.tsx integration

    5. **Applied SettingsCard Pattern**: Uses unified SettingsCard with
    consistent hover effects, action buttons, and accessibility features


    The component now displays configuration.customName as title and simple
    provider label as content, with edit/delete handlers properly integrated.
    All quality checks (lint, format, type-check) and unit tests pass
    successfully. The refactored component maintains full functionality while
    providing visual consistency with other SettingsCard implementations across
    the application.
schema: v1.0
childrenIds: []
created: 2025-09-02T02:46:25.555Z
updated: 2025-09-02T02:46:25.555Z
---

## Context

Completely replace the LlmProviderCard component by deleting the existing implementation and using the SettingsCard component with simplified content display showing only the provider name.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`
Reference SettingsCard: `/Users/zach/code/fishbowl/apps/desktop/src/components/ui/SettingsCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Replace the entire LlmProviderCard implementation with SettingsCard usage, removing all complex functionality.

**File to modify**: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

### Complete Implementation Replacement

Delete the existing component implementation and replace with:

- **Title**: `configuration.customName`
- **Content**: Provider label only (e.g., "OpenAI", "Anthropic")
- **Handlers**: Direct SettingsCard integration
- **Remove**: All complex features, helper functions, and styling

### Content Transformation

Replace complex multi-line content with simple provider identification:

- Use `getProviderInfo(configuration.provider).label` for content
- Remove API key masking, timestamps, auth headers
- Remove provider-specific color coding
- Simplify to basic provider name display

### Handler Integration

Transform to work with SettingsCard:

- `onEdit: () => onEdit(configuration)`
- `onDelete: () => onDelete(configuration.id)`
- Maintain existing prop interface compatibility

### Remove All Complex Features

Delete the following entirely:

- `maskApiKey` function and logic
- `formatRelativeTime` function and logic
- Complex Card layout with multiple sections
- API key display and masking
- Timestamp formatting and display
- Authorization header information
- Provider-specific color classes
- Complex memoization and comparison logic

## Detailed Acceptance Criteria

### Replacement Requirements

- ✅ Entire component implementation replaced with SettingsCard usage
- ✅ All helper functions removed (maskApiKey, formatRelativeTime)
- ✅ Complex Card structure deleted and replaced
- ✅ Component file significantly simplified (under 50 lines)
- ✅ Only essential provider info resolution kept

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays configuration.customName as title
- ✅ Displays provider label (OpenAI/Anthropic) as content only
- ✅ Edit button triggers existing onEdit with configuration object
- ✅ Delete button triggers existing onDelete with configuration ID
- ✅ Maintains LlmProviderCardProps interface externally

### Code Simplification

- ✅ Removes all complex imports (multiple Card components, complex styling)
- ✅ Adds SettingsCard import from ui components
- ✅ Keeps only getProviderInfo function for label resolution
- ✅ Removes React.memo with complex comparison logic
- ✅ Simplifies JSDoc to reflect basic functionality
- ✅ Eliminates useMemo optimizations and complex state

### Integration Requirements

- ✅ Works with existing LLM setup page without changes
- ✅ Maintains same external API (props interface unchanged)
- ✅ Visual consistency with other SettingsCard implementations
- ✅ No functionality regressions for edit/delete operations

## Technical Approach

1. **Complete Implementation Replacement**:
   - Delete entire existing component implementation
   - Replace with simple SettingsCard wrapper
   - Keep only essential provider label resolution
   - Remove all complex logic and helper functions

2. **Minimal Code Retention**:
   - Keep getProviderInfo function for provider label
   - Keep LlmProviderCardProps interface
   - Keep basic component structure and exports
   - Remove everything else

3. **SettingsCard Integration**:
   - Import SettingsCard from ui components
   - Pass configuration.customName as title
   - Pass providerInfo.label as content
   - Wrap existing handlers for SettingsCard API

4. **Cleanup**:
   - Remove unused imports and dependencies
   - Delete helper functions and constants
   - Simplify JSDoc documentation
   - Remove performance optimizations

## New Implementation Structure

```typescript
/**
 * LlmProviderCard component displays basic LLM provider information.
 * Uses SettingsCard for consistent styling and interaction patterns.
 */

import type { LlmConfigMetadata, Provider } from "@fishbowl-ai/shared";
import React from "react";
import { SettingsCard } from "../../ui/SettingsCard";

interface LlmProviderCardProps {
  configuration: LlmConfigMetadata;
  onEdit: (config: LlmConfigMetadata) => void;
  onDelete: (configId: string) => void;
  className?: string;
}

const getProviderInfo = (provider: Provider) => {
  switch (provider) {
    case "openai":
      return { label: "OpenAI" };
    case "anthropic":
      return { label: "Anthropic" };
    default:
      return { label: "Unknown" };
  }
};

export const LlmProviderCard: React.FC<LlmProviderCardProps> = ({
  configuration,
  onEdit,
  onDelete,
  className,
}) => {
  const providerInfo = getProviderInfo(configuration.provider);

  return (
    <SettingsCard
      title={configuration.customName}
      content={providerInfo.label}
      onEdit={() => onEdit(configuration)}
      onDelete={() => onDelete(configuration.id)}
      className={className}
    />
  );
};
```

## Dependencies

- T-create-settingscard-component (must complete first)
- SettingsCard component must be available
- Existing LlmConfigMetadata types (unchanged)

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays configuration.customName correctly
- ✅ Content displays provider label only
- ✅ Edit handler passes configuration object to onEdit
- ✅ Delete handler passes configuration ID to onDelete
- ✅ Custom className prop works correctly
- ✅ Provider info resolution works for all providers

### Integration Testing

- ✅ Works correctly in LLM setup settings page
- ✅ Provider configurations display with simplified content
- ✅ Edit and delete operations function correctly
- ✅ Visual consistency maintained with other SettingsCard uses

## Security Considerations

- ✅ No sensitive API key data displayed (completely removed)
- ✅ Callback functions properly scoped and validated
- ✅ Configuration data handled securely
- ✅ No XSS risks in simplified content display

## Out of Scope

- Changes to parent components or LLM setup page
- Modifications to LlmConfigMetadata type definitions
- Complex provider-specific features or styling
- API key management or security features (removed entirely)
- Performance optimizations beyond basic implementation
