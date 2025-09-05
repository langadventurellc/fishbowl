---
id: T-add-ondelete-prop-to
title: Add onDelete prop to AgentPillProps interface
status: done
priority: medium
parent: F-delete-conversation-agent
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/chat/AgentPillProps.ts: "Added optional onDelete
    prop with comprehensive JSDoc documentation following existing patterns.
    Prop signature: onDelete?: (conversationAgentId: string) => void. Maintains
    backward compatibility and alphabetical ordering between onClick and
    onToggleEnabled props."
log:
  - "Successfully added optional onDelete prop to AgentPillProps interface with
    comprehensive JSDoc documentation. The prop follows the exact signature
    pattern (conversationAgentId: string) => void and maintains backward
    compatibility with existing implementations. Added detailed documentation
    explaining when the callback is triggered (delete button clicks on agent
    pills) and includes parameter documentation. The interface maintains
    alphabetical ordering and follows all existing patterns. All quality checks
    pass and shared packages have been rebuilt."
schema: v1.0
childrenIds: []
created: 2025-09-05T17:04:51.525Z
updated: 2025-09-05T17:04:51.525Z
---

# Add onDelete Prop to AgentPillProps Interface

## Context

This task adds the necessary TypeScript interface changes to support the delete functionality in AgentPill components. The new optional `onDelete` prop will be used by AgentPill components to handle delete button clicks.

**Feature Reference**: F-delete-conversation-agent  
**Related Files**: `packages/ui-shared/src/types/chat/AgentPillProps.ts`

## Detailed Implementation Requirements

### Primary Objective

Add an optional `onDelete` callback prop to the `AgentPillProps` interface to support delete functionality while maintaining backward compatibility with existing AgentPill usage.

### Technical Approach

1. **Interface Enhancement**:

   ```typescript
   export interface AgentPillProps {
     // ... existing props

     /**
      * Optional handler for deleting agent from conversation.
      * Called when user clicks the delete (X) button on the agent pill.
      * Receives the conversation agent ID for identification.
      */
     onDelete?: (conversationAgentId: string) => void;
   }
   ```

2. **Implementation Details**:
   - Add the new prop as optional (using `?`) for backward compatibility
   - Follow existing documentation patterns with comprehensive JSDoc
   - Use the same parameter pattern as `onToggleEnabled` (conversationAgentId)
   - Maintain alphabetical ordering of props in the interface

### Detailed Acceptance Criteria

**Interface Requirements**:

- ✅ Add optional `onDelete` prop to AgentPillProps interface
- ✅ Prop signature matches pattern: `(conversationAgentId: string) => void`
- ✅ Prop is marked as optional with `?` to maintain backward compatibility
- ✅ Includes comprehensive JSDoc documentation explaining usage

**Documentation Requirements**:

- ✅ JSDoc includes clear description of when the callback is triggered
- ✅ Documents the parameter (conversationAgentId) and its purpose
- ✅ Follows existing documentation style and formatting
- ✅ Includes example usage pattern if helpful

**Compatibility Requirements**:

- ✅ Maintains backward compatibility with existing AgentPill usage
- ✅ Does not break any existing type definitions
- ✅ Follows existing prop naming conventions
- ✅ Integrates seamlessly with existing optional props pattern

**Testing Requirements**:

- ✅ Verify TypeScript compilation passes with new prop
- ✅ Verify backward compatibility (components work without onDelete prop)
- ✅ Verify new prop can be passed correctly from parent components
- ✅ Update any existing AgentPillProps tests to accommodate new prop

### Implementation Notes

**Follow Existing Patterns**:

- Use the same parameter type as `onToggleEnabled` (conversationAgentId string)
- Follow the same JSDoc formatting as other callback props
- Maintain the existing prop ordering and organization
- Use consistent callback signature patterns

**File Location**: `packages/ui-shared/src/types/chat/AgentPillProps.ts`

**Integration Considerations**:

- This interface change enables the AgentPill component to accept delete handlers
- The prop will be passed down from AgentLabelsContainerDisplay
- The conversationAgentId parameter allows precise identification of which agent to delete

### Example Implementation

```typescript
export interface AgentPillProps {
  // ... existing props (agent, onClick, onToggleEnabled, etc.)

  /**
   * Optional handler for deleting agent from conversation.
   * Called when user clicks the delete (X) button on the agent pill.
   * Receives the conversation agent ID for precise agent identification.
   *
   * When provided, an X button will appear on the right side of the pill
   * when the user hovers over it. Clicking this button will trigger
   * this callback with the conversationAgentId parameter.
   *
   * @param conversationAgentId - The unique ID of the conversation agent to delete
   */
  onDelete?: (conversationAgentId: string) => void;

  // ... remaining existing props
}
```

### Security Considerations

- **Type Safety**: Ensure proper TypeScript typing for the callback
- **Parameter Validation**: Document that conversationAgentId should be validated by implementers
- **Callback Safety**: Interface doesn't enforce authorization - that's handled in implementations

### Dependencies

- **Prerequisites**: None (foundational type definition)
- **Depends on**: Existing AgentPillProps interface structure

### Out of Scope

- **Component Implementation**: The actual X button and delete functionality will be implemented in separate tasks
- **Usage Implementation**: How components use this prop will be handled in component-specific tasks
- **Testing Integration**: Full integration testing will be handled in higher-level tasks

## Success Metrics

- ✅ AgentPillProps interface includes optional onDelete prop
- ✅ TypeScript compilation passes without errors
- ✅ Maintains backward compatibility with existing usage
- ✅ Documentation clearly explains prop purpose and usage
- ✅ Follows established interface patterns and conventions
