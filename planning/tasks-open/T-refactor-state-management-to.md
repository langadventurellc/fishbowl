---
kind: task
id: T-refactor-state-management-to
title: Refactor state management to move local state into layout components
status: open
priority: normal
prerequisites: []
created: "2025-07-25T13:36:05.525882"
updated: "2025-07-25T13:36:05.525882"
schema_version: "1.1"
---

# Refactor State Management to Move Local State into Layout Components

## Context

The LayoutShowcase currently manages several pieces of state that would be better encapsulated within their respective layout components. This refactoring will improve component architecture by moving state closer to where it's used and making components more self-contained and reusable.

## Current State Issues

The LayoutShowcase manages three pieces of state that don't belong at the showcase level:

```typescript
const [inputText] = useState("");
const [isManualMode] = useState(true);
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
```

These states are used deep within the component hierarchy and should be managed by the components that actually use them.

## Proposed State Refactoring

### 1. Move `isSidebarCollapsed` to ConversationLayoutDisplay

**Current:** LayoutShowcase manages sidebar collapse state and passes it down through props
**Target:** ConversationLayoutDisplay manages its own sidebar collapse state internally

**Benefits:**

- ConversationLayoutDisplay becomes self-contained for layout management
- Reduces prop drilling from parent components
- Makes the component more reusable across different contexts
- Follows component responsibility principles

### 2. Move `inputText` and `isManualMode` to MainContentPanelDisplay

**Current:** LayoutShowcase manages input-related state and passes it through InputContainerDisplay props
**Target:** MainContentPanelDisplay manages input state internally and passes it to InputContainerDisplay

**Benefits:**

- Input-related state stays within the main content area where it's used
- MainContentPanelDisplay becomes more autonomous
- Cleaner separation of concerns
- Better component encapsulation

## Implementation Requirements

### Update ConversationLayoutDisplay

**Props Interface Changes:**

```typescript
interface ConversationLayoutDisplayProps {
  // ... existing props ...

  // New optional props for state management
  defaultSidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
}
```

**Internal State Management:**

```typescript
// Inside ConversationLayoutDisplay component
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
  defaultSidebarCollapsed ?? false,
);

const handleSidebarToggle = () => {
  const newCollapsed = !isSidebarCollapsed;
  setIsSidebarCollapsed(newCollapsed);
  onSidebarToggle?.(newCollapsed);
};
```

### Update MainContentPanelDisplay

**Props Interface Changes:**

```typescript
interface MainContentPanelDisplayProps {
  // ... existing props ...

  // New optional props for input state management
  defaultInputText?: string;
  defaultManualMode?: boolean;
  onInputChange?: (text: string) => void;
  onModeChange?: (isManual: boolean) => void;
}
```

**Internal State Management:**

```typescript
// Inside MainContentPanelDisplay component
const [inputText, setInputText] = useState(defaultInputText ?? "");
const [isManualMode, setIsManualMode] = useState(defaultManualMode ?? true);

// Pass state to InputContainerDisplay through props
```

### Update LayoutShowcase

**Simplified State:**

```typescript
// Remove these state variables:
// const [inputText] = useState("");
// const [isManualMode] = useState(true);
// const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// Components now manage their own state internally
<ConversationLayoutDisplay
  defaultSidebarCollapsed={false}
  // ... other props
/>

<MainContentPanelDisplay
  defaultInputText=""
  defaultManualMode={true}
  // ... other props
/>
```

## Acceptance Criteria

### ✅ **ConversationLayoutDisplay State Management**

- [ ] ConversationLayoutDisplay manages `isSidebarCollapsed` state internally
- [ ] Add optional `defaultSidebarCollapsed` prop for initial state
- [ ] Add optional `onSidebarToggle` callback prop for parent notification
- [ ] Remove sidebar toggle handling from LayoutShowcase
- [ ] Sidebar toggle functionality continues to work identically
- [ ] Component prop interface updated in shared package

### ✅ **MainContentPanelDisplay State Management**

- [ ] MainContentPanelDisplay manages `inputText` and `isManualMode` states internally
- [ ] Add optional `defaultInputText` and `defaultManualMode` props for initial state
- [ ] Add optional `onInputChange` and `onModeChange` callback props
- [ ] Remove input state management from LayoutShowcase
- [ ] Input functionality continues to work identically
- [ ] Component prop interface updated in shared package

### ✅ **LayoutShowcase Simplification**

- [ ] Remove all three state variables from LayoutShowcase
- [ ] Remove corresponding setState functions and handlers
- [ ] Update component usage to rely on internal state management
- [ ] Verify no functionality is lost in the refactoring
- [ ] All interactive behaviors continue to work as before

### ✅ **Component Architecture Improvements**

- [ ] Components are more self-contained and reusable
- [ ] State is managed closer to where it's used
- [ ] Reduced prop drilling from parent components
- [ ] Better separation of concerns between components
- [ ] Component interfaces follow best practices

### ✅ **Quality Requirements**

- [ ] TypeScript compilation succeeds without errors
- [ ] All linting rules pass
- [ ] No visual or functional regressions
- [ ] Components can be tested independently with their own state
- [ ] State management follows React best practices

## Implementation Notes

### Files to Modify

**Shared Package (Type Interfaces):**

- `packages/shared/src/types/ui/components/ConversationLayoutDisplayProps.ts`
- `packages/shared/src/types/ui/components/MainContentPanelDisplayProps.ts`

**Desktop Components:**

- `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

**Showcase:**

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx`

### State Migration Strategy

1. **Phase 1:** Add new props to component interfaces in shared package
2. **Phase 2:** Update ConversationLayoutDisplay to manage sidebar state
3. **Phase 3:** Update MainContentPanelDisplay to manage input state
4. **Phase 4:** Simplify LayoutShowcase to use new component interfaces
5. **Phase 5:** Test and verify all functionality works correctly

### Testing Requirements

- Manual testing of all interactive behaviors
- Verify sidebar collapse/expand animation works
- Verify input text and mode toggle functionality
- Confirm no visual regressions
- Test component reusability in different contexts

### Security Considerations

- Ensure state updates don't introduce memory leaks
- Proper cleanup of event listeners and state
- No security implications for this internal state refactoring

## Benefits

### Component Architecture

- **Better encapsulation:** Components manage their own relevant state
- **Improved reusability:** Components work independently without external state
- **Cleaner interfaces:** Showcase focuses on composition, not state management
- **Better testability:** Each component can be unit tested with its own state

### Code Quality

- **Reduced complexity:** LayoutShowcase becomes simpler and more focused
- **Better maintainability:** State changes are localized to relevant components
- **Follows React patterns:** Components own their internal state
- **Improved developer experience:** More intuitive component usage

### Future Flexibility

- **Easier component extraction:** Self-contained components are easier to reuse
- **Better component library:** Components work without external dependencies
- **Simplified integration:** Real applications can use components without complex state setup
- **Enhanced component showcase:** Better demonstrates real-world component usage

This refactoring represents a significant improvement in component architecture while maintaining all existing functionality.

### Log
