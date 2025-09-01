---
id: T-extend-servicesprovider-for
title: Extend ServicesProvider for conversation store initialization
status: open
priority: high
parent: F-ui-migration-and-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:26:07.519Z
updated: 2025-09-01T06:26:07.519Z
---

## Purpose

Extend the existing ServicesProvider to initialize the conversation domain store with the ConversationIpcAdapter, following established dependency injection patterns in the codebase.

## Context

The feature specification requires integrating the conversation store with the existing service provider architecture. The ConversationIpcAdapter is already available in RendererProcessServices (apps/desktop/src/renderer/services/RendererProcessServices.ts) and needs to be injected into the conversation store during app startup.

## Detailed Implementation Requirements

### Service Provider Integration

Modify `apps/desktop/src/contexts/ServicesProvider.tsx` to:

1. Import `useConversationStore` from `@fishbowl-ai/ui-shared`
2. Add useEffect to initialize the conversation store with the conversation service
3. Follow the existing pattern used for other service initializations
4. Ensure initialization happens after services are available but before children render

### Implementation Pattern

```typescript
export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const servicesInstance = services || new RendererProcessServices();

  useEffect(() => {
    // Initialize conversation store with the conversation service
    const conversationStore = useConversationStore.getState();
    conversationStore.initialize(servicesInstance.conversationService);
  }, [servicesInstance]);

  return (
    <ServicesContext.Provider value={servicesInstance}>
      {children}
    </ServicesContext.Provider>
  );
}
```

### Technical Approach

1. **Import conversation store hook**: Add import from `@fishbowl-ai/ui-shared`
2. **Access store instance**: Use `useConversationStore.getState()` to get store instance
3. **Initialize with service**: Call `initialize()` method with `conversationService` from services
4. **Dependency management**: Include `servicesInstance` in useEffect dependencies
5. **Error handling**: Ensure service availability before initialization

## Acceptance Criteria

- [ ] ServicesProvider imports useConversationStore correctly
- [ ] useEffect initializes conversation store with conversationService
- [ ] Initialization happens once during app startup
- [ ] Error handling prevents initialization failures
- [ ] Existing service provider functionality remains unchanged
- [ ] ConversationService is properly injected into the store
- [ ] No runtime errors during app initialization
- [ ] Unit tests verify initialization behavior

## Testing Requirements

- [ ] Write unit tests for ServicesProvider initialization
- [ ] Test conversation store receives the correct service instance
- [ ] Test initialization happens exactly once
- [ ] Test error handling when service is unavailable
- [ ] Verify existing provider functionality is preserved

## Dependencies

- **Prerequisites**: F-conversation-domain-store (conversation store and adapter implementation)
- **Service dependency**: ConversationIpcAdapter available in RendererProcessServices
- **Store dependency**: useConversationStore available in ui-shared package

## Out of Scope

- Creating new provider components (use existing ServicesProvider)
- Modifying the conversation store implementation itself
- Changes to other service initialization patterns
- UI component modifications (handled in subsequent tasks)

## Implementation Notes

- **Follow existing patterns**: Use same dependency injection approach as other services
- **Maintain provider structure**: Don't change the existing ServicesProvider interface
- **Single initialization**: Ensure store is initialized exactly once per app lifecycle
- **Error boundaries**: Handle initialization failures gracefully
