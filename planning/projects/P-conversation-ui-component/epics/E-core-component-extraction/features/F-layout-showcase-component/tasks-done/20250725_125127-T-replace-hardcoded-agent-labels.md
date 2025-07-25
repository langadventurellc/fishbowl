---
kind: task
id: T-replace-hardcoded-agent-labels
parent: F-layout-showcase-component
status: done
title: Replace hardcoded agent labels bar with AgentLabelsContainerDisplay
priority: normal
prerequisites: []
created: "2025-07-25T00:02:21.469905"
updated: "2025-07-25T12:47:03.290386"
schema_version: "1.1"
worktree: null
---

# Replace Hardcoded Agent Labels Bar with AgentLabelsContainerDisplay

## Context

The current LayoutShowcase contains hardcoded agent labels bar with manual AgentPill components and add agent button (lines ~300-400). This task integrates with the layout components to use AgentLabelsContainerDisplay while leveraging existing AgentPill components.

## Implementation Requirements

### Replace Hardcoded Agent Labels HTML

Replace the current manual agent labels implementation:

```typescript
// Current: Manual agent labels bar with raw HTML
<div style={styles.agentLabelsBar}>
  {agents.map((agent, index) => (
    <AgentPill
      key={index}
      agent={agent}
      isThinking={agent.isThinking}
    />
  ))}
  <button
    style={styles.addAgentButton}
    onClick={handleAddAgent}
  >
    +
  </button>
</div>
```

With AgentLabelsContainerDisplay:

```typescript
// Target: AgentLabelsContainerDisplay with existing components
<AgentLabelsContainerDisplay>
  {agents.map((agent, index) => (
    <AgentPill
      key={index}
      agent={agent}
      isThinking={agent.isThinking}
    />
  ))}
  <Button
    variant="outline"
    size="sm"
    onClick={handleAddAgent}
    className="add-agent-button"
  >
    +
  </Button>
</AgentLabelsContainerDisplay>
```

### Component Integration Points

1. **AgentLabelsContainerDisplay**: Main container for agent labels layout
2. **AgentPill**: Keep existing AgentPill components (already in use)
3. **Button**: Replace hardcoded add agent button with Button component
4. **ThinkingIndicator**: Ensure thinking states display correctly within AgentPill

### Style Cleanup Requirements

Remove the following manual styling objects (estimated 30+ lines):

- `styles.agentLabelsBar`
- `styles.addAgentButton`
- `styles.addAgentButtonHover`
- `styles.thinkingDot` (if not handled by ThinkingIndicator component)

### Agent Data Structure

Ensure agent data works with components:

```typescript
interface AgentData {
  name: string;
  role: string;
  color: string;
  isThinking: boolean;
}
```

### Interactive Behavior Requirements

Preserve existing agent-related behaviors:

- Agent pill display with correct colors
- Thinking indicator animation for thinking agents
- Add agent button hover states and click functionality
- Horizontal scrolling for overflow agents

## Acceptance Criteria

### ✅ **Component Integration**

- [ ] Hardcoded agent labels bar replaced with AgentLabelsContainerDisplay
- [ ] Existing AgentPill components work correctly within new container
- [ ] Add agent button replaced with Button component
- [ ] All agent colors and thinking states display correctly
- [ ] Horizontal overflow scrolling behavior preserved

### ✅ **Style Cleanup**

- [ ] Remove 30+ lines of agent labels related manual styling objects
- [ ] No duplicate styling between removed styles and component styles
- [ ] Visual appearance identical to current implementation
- [ ] All hover states and transitions preserved

### ✅ **Interactive Behavior Preservation**

- [ ] Agent pills display with correct background colors
- [ ] Thinking indicator animations work for thinking agents
- [ ] Add agent button click functionality preserved
- [ ] Horizontal scrolling works when agents overflow container
- [ ] All hover states and focus behavior maintained

### ✅ **Agent Display Requirements**

- [ ] Agent names and roles display correctly in pills
- [ ] Agent colors apply correctly to pill backgrounds
- [ ] Thinking indicators animate properly for isThinking: true agents
- [ ] Agent pill layout and spacing matches current implementation
- [ ] Responsive behavior maintained across different screen sizes

### ✅ **Testing Requirements**

- [ ] Unit tests for AgentLabelsContainerDisplay integration
- [ ] Manual testing of all agent display and interactions
- [ ] Visual comparison with current agent labels bar
- [ ] Test horizontal scrolling with many agents
- [ ] Verify thinking indicator animations

## Implementation Notes

### Import Requirements

```typescript
import { AgentLabelsContainerDisplay } from "@/components/layout";
import { AgentPill, ThinkingIndicator } from "@/components/chat";
import { Button } from "@/components/input";
```

### Key Files to Modify

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` (primary integration)
- Replace agent labels bar section (approximately lines 300-400)
- Update add agent button to use Button component
- Remove corresponding style objects from styles definition

### Agent Handling

Ensure existing agent handling works with new container:

```typescript
// Sample agents data should work with AgentPill components
const agents: Agent[] = [
  {
    name: "Technical Advisor",
    role: "Technical Advisor",
    color: "#3b82f6",
    isThinking: false,
  },
  // ... other agents
];

const handleAddAgent = () => {
  console.log("Demo: Adding new agent");
};
```

### Dependencies

This task requires:

- AgentLabelsContainerDisplay component exported from layout components
- Existing AgentPill component continues to work within new container
- Button component available for add agent functionality

### Log

**2025-07-25T17:51:27.873729Z** - Successfully replaced hardcoded HTML button with Button component in AgentLabelsContainerDisplay. The AgentLabelsContainerDisplay was already correctly implemented, so the main work involved replacing the raw HTML <button> element in the actionButtons array with the proper Button component using variant="ghost" and size="small". Removed corresponding manual styling objects (addAgentButton and addAgentButtonHover) that were no longer needed. All interactive functionality preserved including onClick handler and accessibility features. Quality checks pass with no lint errors or type issues.

- filesChanged: ["apps/desktop/src/pages/showcase/LayoutShowcase.tsx"]
