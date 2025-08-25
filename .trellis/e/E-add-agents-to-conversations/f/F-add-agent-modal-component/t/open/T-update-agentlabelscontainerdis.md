---
id: T-update-agentlabelscontainerdis
title: Update AgentLabelsContainerDisplayProps to include selectedConversationId
status: open
priority: medium
parent: F-add-agent-modal-component
prerequisites:
  - T-create-addagenttoconversationm
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T17:43:10.736Z
updated: 2025-08-25T17:43:10.736Z
---

# Update AgentLabelsContainerDisplayProps Interface

## Context

Extend the existing AgentLabelsContainerDisplayProps interface to accept selectedConversationId parameter, enabling the component to integrate with the useConversationAgents hook and display conversation-specific agents.

## Related Work

- Feature: F-add-agent-modal-component
- Epic: E-add-agents-to-conversations
- Prerequisites: T-create-addagenttoconversationm (props interface for modal)
- Current File: packages/ui-shared/src/types/chat/AgentLabelsContainerDisplayProps.ts

## Implementation Requirements

### 1. Update Props Interface

**File**: `packages/ui-shared/src/types/chat/AgentLabelsContainerDisplayProps.ts`

**Changes Required**:

```typescript
export interface AgentLabelsContainerDisplayProps {
  // Existing properties remain unchanged
  agents: AgentViewModel[];
  onAddAgent?: () => void;
  barHeight?: string | number;
  agentSpacing?: string | number;
  containerPadding?: string;
  horizontalScroll?: boolean;
  showBottomBorder?: boolean;
  backgroundVariant?: "card" | "background" | "transparent";
  className?: string;
  style?: React.CSSProperties;

  // NEW: Add selectedConversationId property
  /**
   * ID of the currently selected conversation.
   * Used to load conversation-specific agents and enable/disable the Add Agent button.
   * When null, the Add Agent button should be disabled.
   */
  selectedConversationId?: string | null;
}
```

### 2. Update JSDoc Documentation

**Documentation Updates**:

- Add comprehensive JSDoc for selectedConversationId property
- Explain the relationship to Add Agent button state
- Document null handling behavior
- Update module-level documentation to reflect new functionality

### 3. Update Unit Tests

**File**: `packages/ui-shared/src/types/chat/__tests__/AgentLabelsContainerDisplayProps.test.ts`

**New Test Cases**:

- Verify selectedConversationId property exists and is optional
- Test type compatibility with string | null | undefined
- Validate JSDoc documentation presence
- Ensure backward compatibility with existing usage

**Test Structure**:

```typescript
describe("AgentLabelsContainerDisplayProps Interface", () => {
  it("includes selectedConversationId as optional property", () => {
    // Type-only test to verify interface structure
    const validProps: AgentLabelsContainerDisplayProps = {
      agents: [],
      selectedConversationId: "conversation-123",
    };
    expect(validProps).toBeDefined();
  });

  it("accepts null selectedConversationId", () => {
    const validProps: AgentLabelsContainerDisplayProps = {
      agents: [],
      selectedConversationId: null,
    };
    expect(validProps).toBeDefined();
  });

  it("works without selectedConversationId (backward compatibility)", () => {
    const validProps: AgentLabelsContainerDisplayProps = {
      agents: [],
    };
    expect(validProps).toBeDefined();
  });
});
```

## Technical Approach

### 1. Backward Compatibility

- Make selectedConversationId optional to maintain existing component usage
- Existing components not using this prop should continue working
- Gradual migration approach for components that need conversation context

### 2. Type Safety

- Use union type (string | null) to handle both selected and unselected states
- Optional property (?) to maintain backward compatibility
- Clear documentation for null handling behavior

### 3. Integration Preparation

- Interface designed to support useConversationAgents hook integration
- Property name matches conversation ID patterns from existing hooks
- Supports conditional Add Agent button logic

## Acceptance Criteria

### Type System Requirements

- ✅ selectedConversationId property added as optional string | null
- ✅ TypeScript compilation passes for interface file
- ✅ Backward compatibility maintained (existing usage works)
- ✅ Interface exported properly through barrel export

### Documentation Requirements

- ✅ Comprehensive JSDoc for new property
- ✅ Usage examples in documentation
- ✅ Null handling behavior documented
- ✅ Relationship to Add Agent functionality explained

### Testing Requirements

- ✅ Unit tests verify interface structure
- ✅ Type compatibility tests for different values
- ✅ Backward compatibility tests
- ✅ Import/export validation tests

### Integration Requirements

- ✅ Interface supports useConversationAgents hook integration
- ✅ Property structure matches conversation patterns
- ✅ Design supports conditional button logic
- ✅ Compatible with prop drilling chain requirements

## Dependencies

- AddAgentToConversationModalProps interface (prerequisite)

## Files to Modify

- `packages/ui-shared/src/types/chat/AgentLabelsContainerDisplayProps.ts`
- `packages/ui-shared/src/types/chat/__tests__/AgentLabelsContainerDisplayProps.test.ts` (if exists, otherwise create)

## Quality Checks

- Run `pnpm type-check` to verify TypeScript compilation
- Run `pnpm test` to ensure unit tests pass
- Run `pnpm quality` for linting and formatting validation
