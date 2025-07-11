# Chat Room Mechanics Specification

## Overview

The chat room system manages multi-agent conversations with two primary modes: Manual (user controls which agent responses are added) and Auto (agents take turns responding automatically). The system uses an enhanced round-robin approach with intelligent skip detection and @ mention support.

## Core Mechanics

### Turn Management

#### Agent Order

- Agents respond in the order they were added to the conversation
- Order visible in the agent labels bar at top of chat
- New agents added to end of queue
- Removed agents simply removed from queue

#### Queue System

```typescript
interface TurnQueue {
  agents: AgentId[]; // Ordered list of active agents
  currentIndex: number; // Current position in queue
  waitingForResponse: AgentId | null;
  skipCount: Map<AgentId, number>; // Track consecutive skips
}
```

### Response Flow

#### Auto Mode Sequence

1. User posts initial message
2. First agent (index 0) receives conversation history (only active messages)
3. Agent evaluates if they should respond using skip logic
4. If responding:
   - Generate response with configured model parameters
   - Add to conversation history as active (checked)
   - Move to next agent
5. If skipping:
   - Add system message: "[Agent Name] skipped their turn"
   - Move to next agent
6. Continue until stop condition met

#### Manual Mode Sequence

1. User posts message
2. ALL active agents evaluate and generate responses
3. Responses shown as pending cards above input
4. User selects which responses to include (checked/unchecked)
5. Selected responses added to message history as active
6. Unselected responses added to message history as inactive (faded, unchecked)
7. Process repeats

#### Message State Management

- **Active Messages**: Included in conversation history for API calls
- **Inactive Messages**: Visible in UI but excluded from API conversation history
- Users can toggle any message's active/inactive state at any time
- Toggling affects all future API calls

## Skip Turn Logic

### Implementation

Agents include skip evaluation in their system prompt:

```
Before responding, evaluate if you have something valuable to add to the conversation.
If the current discussion is outside your expertise or you have nothing meaningful
to contribute, respond with exactly "SKIP" instead of a regular response.
```

### Skip Handling

- Skipped agents remain in queue
- System message added: "[Agent Name | Role] skipped their turn"
- Agent gets opportunity on next round
- No penalty for skipping

## @ Mention System

### Syntax

- Format: `@AgentName` (not role, to handle duplicates)
- Case-insensitive matching
- Partial matches resolved to first match

### Behavior

1. When @ mention detected in any message:
   - Mentioned agent inserted next in queue
   - After their response, queue returns to normal order
2. Multiple mentions (`@Alice @Bob`):
   - Both agents respond simultaneously
   - Responses added in their normal order
3. Agents can @ mention each other
4. Self-mentions ignored

### Example Flow

```
Queue: [Alice, Bob, Charlie]
User: "@Charlie what do you think?"
Next: [Charlie, Alice, Bob]  // Charlie inserted, then normal order
```

## Auto Mode Control

### Start/Stop

- **Toggle Switch**: Primary control in UI
- **Keyboard Shortcut**: Cmd/Ctrl+M
- **Start**: Begins with first agent in queue
- **Stop**: Immediately halts generation

### Stop Conditions

1. **Manual Toggle**: User switches to manual mode
2. **All Agents Skip**: Full round where every agent skips
3. **Message Limit**: Reaches X messages (configurable)
4. **Error**: API failure or rate limit
5. **Context Limit**: Approaching token limit

### Configuration (General Settings)

```typescript
interface AutoModeSettings {
  responseDelay: number; // 1-30 seconds between messages
  maxMessages: number; // Stop after X messages (0 = unlimited)
  maxWaitTime: number; // Max seconds to wait for response
}
```

## Agent Participation Control

### Pause/Resume Individual Agents

- Click agent label (not X button) to toggle participation
- Visual indicator: Grayed out when paused
- Paused agents:
  - Skipped in auto mode
  - Don't generate responses in manual mode
  - Remain in conversation (can be resumed)

### States

```typescript
interface AgentState {
  id: string;
  active: boolean; // In conversation
  participating: boolean; // Not paused
  thinking: boolean; // Currently generating
}
```

## Message Timing & Queuing

### Response Delays

- Configurable: 1-30 seconds between messages
- Applies after message added to history
- Timer shown in UI: "Next response in Xs"

### User Input During Auto Mode

- Input field disabled during auto mode
- Must toggle to manual mode to type
- Pending agent responses preserved when switching

### Status Indicators

- **Thinking**: "[Agent Name | Role] _thinking..._"
- **Queued**: "3 agents waiting to respond"
- **Paused**: "Auto mode paused"

## Context Window Management

### Monitoring

```typescript
interface ContextStatus {
  currentTokens: number;
  maxTokens: number; // From model config
  warningThreshold: 0.8; // 80% full
}
```

### Handling Limits

1. **Warning**: Toast notification at 80% capacity
2. **Critical**: Auto mode stops at 95% capacity
3. **Error Message**: "Conversation approaching model context limit"
4. **User Action Required**: Start new conversation or wait for V2 summarization

## Error Handling

### API Failures

1. Pause auto mode immediately
2. Show error in chat: "⚠️ [Agent] Failed to respond: [Error]"
3. Retry button available
4. Other agents can continue if error resolved

### Rate Limiting

1. Global rate limit tracking across all agents
2. Pause auto mode on any rate limit error
3. Show countdown: "Rate limited. Retry in 30s"
4. Queue preserved for resume

## Special Messages

### System Messages

Styled differently (gray, italic):

- "[Agent Name | Role] joined the conversation"
- "[Agent Name | Role] left the conversation"
- "[Agent Name | Role] skipped their turn"
- "Auto mode started/stopped"
- "Conversation paused: [Reason]"

### Message Types

```typescript
type MessageType =
  | 'user' // Human message
  | 'agent' // AI response
  | 'system' // System notification
  | 'error' // Error message
  | 'pending'; // Manual mode preview
```

## Mode Switching

### Manual → Auto

1. Any pending responses kept in preview
2. User must submit/dismiss pending responses first
3. Auto mode starts with first agent in queue

### Auto → Manual

1. Current generation completes
2. Any queued agents generate responses
3. All responses shown as pending cards
4. User selects which to include

## Implementation Notes

### Performance

- Stream responses when possible
- Cancel pending API calls on mode switch
- Debounce rapid toggle switching

### State Persistence

- Queue state saved to conversation
- Mode preference saved per conversation
- Agent participation states preserved

### Future Enhancements

- Smart turn ordering based on conversation flow
- Conversation templates with preset agent orders
- Advanced skip logic with reasons
- Agent memory between turns
- Parallel response generation for speed
