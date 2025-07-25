---
kind: task
id: T-replace-hardcoded-input-area
title: Replace hardcoded input area with InputContainerDisplay components
status: open
priority: high
prerequisites: []
created: "2025-07-25T00:01:58.647641"
updated: "2025-07-25T00:01:58.647641"
schema_version: "1.1"
parent: F-layout-showcase-component
---

# Replace Hardcoded Input Area with InputContainerDisplay Components

## Context

The current LayoutShowcase contains 100+ lines of hardcoded input area with manual styling (lines ~850-950). This task replaces raw input elements with the extracted input components while preserving all interactive behaviors.

## Implementation Requirements

### Replace Raw Input Elements

Replace the current manual input implementation:

```typescript
// Current: Raw input elements with manual styling
<div style={styles.inputArea}>
  <textarea
    style={styles.textarea}
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    placeholder="Type your message here..."
    onKeyDown={handleKeyDown}
  />
  <button
    style={styles.sendButton}
    onClick={handleSendMessage}
    disabled={!inputText.trim()}
  >
    ✈️
  </button>
  <div style={styles.modeToggle}>
    <button
      style={isManualMode ? styles.modeOptionActive : styles.modeOptionInactive}
      onClick={() => setIsManualMode(true)}
    >
      Manual
    </button>
    <button
      style={!isManualMode ? styles.modeOptionActive : styles.modeOptionInactive}
      onClick={() => setIsManualMode(false)}
    >
      Auto
    </button>
  </div>
</div>
```

With InputContainerDisplay components:

```typescript
// Target: Input components
<InputContainerDisplay>
  <MessageInputDisplay
    value={inputText}
    onChange={setInputText}
    placeholder="Type your message here..."
    onSubmit={handleSendMessage}
    disabled={false}
  />
  <SendButtonDisplay
    disabled={!inputText.trim()}
    onClick={handleSendMessage}
    loading={false}
  />
  <ConversationModeToggleDisplay
    currentMode={isManualMode ? "manual" : "auto"}
    onModeChange={(mode) => setIsManualMode(mode === "manual")}
  />
</InputContainerDisplay>
```

### Component Integration Points

1. **InputContainerDisplay**: Main container for input area layout
2. **MessageInputDisplay**: Replace raw textarea with proper component
3. **SendButtonDisplay**: Replace hardcoded send button with component
4. **ConversationModeToggleDisplay**: Replace manual mode toggle buttons

### Style Cleanup Requirements

Remove the following manual styling objects (estimated 80+ lines):

- `styles.inputArea`
- `styles.textarea`
- `styles.textareaFocus`
- `styles.sendButton`
- `styles.sendButtonDisabled`
- `styles.modeToggle`
- `styles.modeOption`
- `styles.modeOptionActive`
- `styles.modeOptionInactive`

### Event Handler Integration

Connect existing event handlers to input components:

- `handleSendMessage()` for send button click and Enter key
- `setInputText(value)` for textarea changes
- Mode toggle functionality for manual/auto switching
- Input validation and disabled states

### Input Behavior Requirements

Preserve all existing input behaviors:

- Send message on Enter key press
- Send button disabled when input is empty
- Textarea auto-resize behavior (if present)
- Mode toggle state management
- Focus states and keyboard navigation

## Acceptance Criteria

### ✅ **Component Integration**

- [ ] All hardcoded input HTML replaced with InputContainerDisplay
- [ ] MessageInputDisplay properly handles text input and events
- [ ] SendButtonDisplay shows correct disabled/enabled states
- [ ] ConversationModeToggleDisplay reflects current mode correctly
- [ ] All existing event handlers properly connected to new components

### ✅ **Style Cleanup**

- [ ] Remove 80+ lines of input-related manual styling objects
- [ ] No duplicate styling between removed styles and component styles
- [ ] Visual appearance identical to current implementation
- [ ] All button states and transitions preserved

### ✅ **Interactive Behavior Preservation**

- [ ] Send message functionality works on button click
- [ ] Send message functionality works on Enter key press
- [ ] Send button disabled state when input is empty
- [ ] Mode toggle switches between manual/auto correctly
- [ ] Textarea focus states and keyboard navigation preserved
- [ ] Input validation works identically to current implementation

### ✅ **Input Functionality**

- [ ] Text input captures all character types correctly
- [ ] Placeholder text displays when input is empty
- [ ] Input clearing works properly after message send
- [ ] Textarea resize behavior maintained (if applicable)
- [ ] All keyboard shortcuts and accessibility features preserved

### ✅ **Testing Requirements**

- [ ] Unit tests for input component prop passing and event handlers
- [ ] Manual testing of all input interactions
- [ ] Visual comparison with current input area
- [ ] Test send functionality with various input states
- [ ] Verify mode toggle state management

## Implementation Notes

### Import Requirements

```typescript
import {
  InputContainerDisplay,
  MessageInputDisplay,
  SendButtonDisplay,
  ConversationModeToggleDisplay,
} from "@/components/input";
```

### Key Files to Modify

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` (primary integration)
- Replace input area section (approximately lines 850-950)
- Update event handlers to work with component interfaces
- Remove corresponding style objects from styles definition

### Event Handler Updates

Ensure existing event handlers work with component interfaces:

```typescript
// handleSendMessage should work with both button click and Enter key
const handleSendMessage = () => {
  if (inputText.trim()) {
    console.log("Demo: Sending message:", inputText);
    setInputText("");
  }
};

// Mode change handler for toggle component
const handleModeChange = (mode: "manual" | "auto") => {
  setIsManualMode(mode === "manual");
};
```

### Dependencies

This task requires all input components to be properly exported from the component library with correct TypeScript interfaces and support for the current event handling patterns.

### Log
