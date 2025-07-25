---
kind: task
id: T-refactor-state-management-to
status: done
title: Refactor state management to move local state into layout components
priority: normal
prerequisites: []
created: "2025-07-25T13:36:05.525882"
updated: "2025-07-25T14:01:04.994154"
schema_version: "1.1"
worktree: null
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

### 1. Refactor ConversationLayoutDisplay Architecture

**Current:** ConversationLayoutDisplay takes sidebar and main content as properties, making it difficult to manage sidebar visibility state internally

**Target:** ConversationLayoutDisplay integrates sidebar and main content layout within itself and takes data properties (conversations, agents, messages) instead

**Rationale:**
The current approach where ConversationLayoutDisplay takes sidebar and main content as properties makes it difficult for the component to maintain the state of whether the sidebar is showing or not. By integrating the layout components within ConversationLayoutDisplay and passing data properties instead, the component can properly manage sidebar toggle state.

**Benefits:**

- ConversationLayoutDisplay can manage sidebar collapse state internally
- Better component encapsulation and state ownership
- More logical component responsibility boundaries
- Easier to implement sidebar toggle functionality

### 2. Update ConversationLayoutDisplay Props Interface

**Current Props:**

```typescript
interface ConversationLayoutDisplayProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  // ... other props
}
```

**Target Props:**

```typescript
interface ConversationLayoutDisplayProps {
  conversations: Conversation[];
  agents: Agent[];
  messages: Message[];
  // ... other props for configuration
}
```

**Benefits:**

- Component receives data rather than pre-built UI elements
- Internal control over layout and state management
- Better separation between data and presentation logic

## Implementation Requirements

### Update ConversationLayoutDisplay Architecture

**Props Interface Changes:**

```typescript
interface ConversationLayoutDisplayProps {
  conversations: Conversation[];
  agents: Agent[];
  messages: Message[];

  // Optional configuration props
  defaultSidebarCollapsed?: boolean;
}
```

**Internal Structure Changes:**

```typescript
// Inside ConversationLayoutDisplay component
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
  defaultSidebarCollapsed ?? false,
);

const handleSidebarToggle = () => {
  const newCollapsed = !isSidebarCollapsed;
  setIsSidebarCollapsed(newCollapsed);
};

// Component now renders sidebar and main content internally
return (
  <div className="conversation-layout">
    <SidebarContainerDisplay
      conversations={conversations}
      agents={agents}
      collapsed={isSidebarCollapsed}
      onToggle={handleSidebarToggle}
    />
    <MainContentPanelDisplay
      messages={messages}
      agents={agents}
    />
  </div>
);
```

### Update MainContentPanelDisplay (Input State Management)

**Props Interface Changes:**

```typescript
interface MainContentPanelDisplayProps {
  messages: Message[];
  agents: Agent[];

  // Optional input state management props
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

**Simplified State and Usage:**

```typescript
// Remove these state variables:
// const [inputText] = useState("");
// const [isManualMode] = useState(true);
// const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// ConversationLayoutDisplay now takes data instead of pre-built components
<ConversationLayoutDisplay
  conversations={hardcodedConversations}
  agents={hardcodedAgents}
  messages={hardcodedMessages}
  defaultSidebarCollapsed={false}
/>

// No longer need to compose sidebar and main content externally:
// - Remove SidebarContainerDisplay composition
// - Remove MainContentPanelDisplay composition
// - Remove prop drilling of sidebar state
```

## Acceptance Criteria

### ✅ **ConversationLayoutDisplay Architecture Refactor**

- [ ] ConversationLayoutDisplay integrates SidebarContainerDisplay and MainContentPanelDisplay internally
- [ ] Props interface changed to accept data properties (conversations, agents, messages)
- [ ] ConversationLayoutDisplay manages `isSidebarCollapsed` state internally
- [ ] Add optional `defaultSidebarCollapsed` prop for initial state
- [ ] Remove sidebar and mainContent props from component interface
- [ ] Sidebar toggle functionality continues to work identically
- [ ] Component prop interface updated in shared package

### ✅ **MainContentPanelDisplay State Management**

- [ ] MainContentPanelDisplay manages `inputText` and `isManualMode` states internally
- [ ] Props interface updated to receive messages and agents data
- [ ] Add optional `defaultInputText` and `defaultManualMode` props for initial state
- [ ] Add optional `onInputChange` and `onModeChange` callback props
- [ ] Input functionality continues to work identically
- [ ] Component prop interface updated in shared package

### ✅ **LayoutShowcase Simplification**

- [ ] Remove all three state variables from LayoutShowcase (inputText, isManualMode, isSidebarCollapsed)
- [ ] Remove corresponding setState functions and handlers
- [ ] Remove external composition of sidebar and main content components
- [ ] Update ConversationLayoutDisplay usage to pass data properties instead of composed components
- [ ] Remove SidebarContainerDisplay and MainContentPanelDisplay from LayoutShowcase JSX
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

- `packages/shared/src/types/ui/components/ConversationLayoutDisplayProps.ts` - Update to accept data properties instead of component props
- `packages/shared/src/types/ui/components/MainContentPanelDisplayProps.ts` - Update to accept messages/agents data

**Desktop Components:**

- `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx` - Refactor to integrate sidebar and main content internally
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx` - Add internal input state management

**Showcase:**

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` - Simplify to pass data instead of composed components

### Implementation Strategy

1. **Phase 1:** Update ConversationLayoutDisplayProps interface to accept data properties
2. **Phase 2:** Refactor ConversationLayoutDisplay to integrate sidebar and main content internally
3. **Phase 3:** Update MainContentPanelDisplay to manage input state internally
4. **Phase 4:** Simplify LayoutShowcase to pass hardcoded data values instead of composed components
5. **Phase 5:** Remove unused state management and component composition from LayoutShowcase
6. **Phase 6:** Test and verify all functionality works correctly

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

- **Better encapsulation:** ConversationLayoutDisplay manages its complete layout internally
- **Improved data flow:** Components receive data rather than pre-built UI elements
- **Cleaner interfaces:** LayoutShowcase focuses on providing data, not managing layout composition
- **Better state ownership:** Sidebar collapse state managed where it's most logical
- **More cohesive components:** Related layout elements are grouped together

### Code Quality

- **Reduced complexity:** LayoutShowcase becomes simpler by removing state management and component composition
- **Better maintainability:** State changes are localized to relevant components
- **Follows React patterns:** Components own their internal state and structure
- **Improved developer experience:** More intuitive component usage with data-driven props
- **Cleaner component boundaries:** Clear separation between data and layout concerns

### Future Flexibility

- **Easier component extraction:** ConversationLayoutDisplay is self-contained and data-driven
- **Better component library:** Components work with data inputs rather than requiring external composition
- **Simplified integration:** Real applications can use ConversationLayoutDisplay by just passing data
- **Enhanced component showcase:** Better demonstrates real-world component usage patterns
- **More realistic architecture:** Reflects how components would be used in production applications

This refactoring represents a significant architectural improvement that makes ConversationLayoutDisplay more self-contained and easier to use while maintaining all existing functionality.

### Log

**2025-07-25T19:13:03.767811Z** - Successfully refactored state management to move local state from LayoutShowcase into layout components themselves. ConversationLayoutDisplay now takes data props (conversations, agents, messages) and manages sidebar collapse state internally. MainContentPanelDisplay now manages input state internally. LayoutShowcase is significantly simplified and only passes data. All interactive functionality continues to work identically with improved component architecture and better separation of concerns.

- filesChanged: ["packages/shared/src/types/ui/components/ConversationLayoutDisplayProps.ts", "packages/shared/src/types/ui/components/MainContentPanelDisplayProps.ts", "apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx", "apps/desktop/src/components/layout/MainContentPanelDisplay.tsx", "apps/desktop/src/pages/showcase/LayoutShowcase.tsx"]
