# Data Flow & Integration Specification

## Overview

This document describes how data flows through the application, from user interactions to AI responses, including state management, API integration, and error handling patterns.

## Component Communication Patterns

### Zustand Store Access

Components connect to the store using hooks for clear data dependencies:

```typescript
// Direct store access for reading state
const messages = useStore(state => state.messages);
const activeAgents = useStore(state => state.agents.filter(a => a.participating));

// Actions access pattern
const { addMessage, toggleAutoMode } = useStore(state => state.actions);
```

### Service Layer Integration

Components should always use abstracted services instead of direct platform APIs:

```typescript
// ❌ Bad: Direct platform API usage
const messages = await window.api.db.getMessages();

// ✅ Good: Service abstraction
const database = ServiceFactory.getDatabaseService();
const messages = await database.query<Message>('SELECT * FROM messages');
```

### State Management Rules

1. **Global State** (in Zustand):
   - Conversation data
   - Agent configurations
   - User preferences
   - Active UI modes

2. **Local State** (React useState):
   - Form inputs
   - Temporary UI states
   - Animation states
   - Validation errors

3. **Derived State** (computed):
   ```typescript
   // Compute in selectors for efficiency
   const participatingAgents = useStore(state =>
     state.agents.filter(a => a.participating && a.active),
   );
   ```

## API Call Lifecycle

### Request Flow

```
User Action → UI Component → Service Layer → AI Provider → Response
     ↓              ↓              ↓             ↓            ↓
Store Update ← UI Update ← Process Response ← Stream/Result ←
```

### Implementation Pattern

```typescript
// services/ai/agent-service.ts
import { ServiceFactory } from '@/services/ServiceFactory';

class AgentService {
  private bridge = ServiceFactory.getBridgeService();

  async generateResponse(
    agent: Agent,
    messages: Message[],
    signal: AbortSignal,
  ): Promise<AsyncIterable<string>> {
    // 1. Update agent state
    agentEvents.emit('agent:thinking', { agentId: agent.id });

    try {
      // 2. Format messages for provider
      const formatted = formatMessagesForProvider(agent.provider, agent.systemPrompt, messages);

      // 3. Call AI provider with streaming
      const stream = await providers[agent.provider].generateStream({
        model: agent.modelId,
        messages: formatted,
        temperature: agent.temperature,
        signal, // For cancellation
      });

      // 4. Return stream for UI consumption
      return stream;
    } catch (error) {
      agentEvents.emit('agent:error', { agentId: agent.id, error });
      throw error;
    }
  }
}
```

### Streaming Response Handling

```typescript
// components/Chat/AgentResponse.tsx
function AgentResponse({ agent, messages }) {
  const [response, setResponse] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function streamResponse() {
      try {
        const stream = await agentService.generateResponse(
          agent,
          messages,
          controller.signal
        );

        // Update UI with streamed chunks
        for await (const chunk of stream) {
          setResponse(prev => prev + chunk);
        }

        setIsComplete(true);
        agentEvents.emit('agent:responded', {
          agentId: agent.id,
          message: response
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleError(error);
        }
      }
    }

    streamResponse();
    return () => controller.abort();
  }, [agent, messages]);

  return <MessageDisplay content={response} streaming={!isComplete} />;
}
```

## State Update Flows

### Message Addition Flow

```typescript
// Manual Mode
1. User types message → Input component
2. Submit → addMessage() action
3. All participating agents start generating
4. Responses stream to PendingResponses component
5. User selects responses → addMultipleMessages() action
6. Store updates → UI rerenders with new messages

// Auto Mode
1. User types message → Input component
2. Submit → addMessage() action
3. First agent in queue generates response
4. Response completes → addMessage() action
5. Next agent triggered automatically
6. Repeat until stop condition
```

### Agent State Transitions

```typescript
interface AgentState {
  status: 'idle' | 'thinking' | 'responded' | 'error' | 'skipped';
  currentResponse?: string;
  error?: Error;
}

// State machine for agent status
idle → thinking → responded/skipped/error → idle
```

### Queue Management Updates

```typescript
// Auto mode queue updates
class TurnManager {
  private queue: AgentId[] = [];
  private currentIndex = 0;

  advance() {
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    useStore.getState().actions.updateTurnQueue(this.queue, this.currentIndex);
  }

  insertAgent(agentId: AgentId, afterCurrent = true) {
    const insertIndex = afterCurrent ? this.currentIndex + 1 : this.queue.length;
    this.queue.splice(insertIndex, 0, agentId);
    useStore.getState().actions.updateTurnQueue(this.queue, this.currentIndex);
  }
}
```

## IPC Communication Flow

### Platform-Agnostic Bridge Pattern

All IPC communication goes through the abstracted BridgeService:

```typescript
// services/conversation/ConversationManager.ts
import { ServiceFactory } from '@/services/ServiceFactory';

export class ConversationManager {
  private bridge = ServiceFactory.getBridgeService();
  private database = ServiceFactory.getDatabaseService();

  async loadConversations(): Promise<Conversation[]> {
    // Uses abstracted database service
    return this.database.query<Conversation>(
      'SELECT * FROM conversations ORDER BY updated_at DESC',
    );
  }

  async saveMessage(message: Message): Promise<void> {
    // Save to database through service
    await this.database.execute(
      'INSERT INTO messages (id, content, conversation_id) VALUES (?, ?, ?)',
      [message.id, message.content, message.conversationId],
    );

    // Notify other parts of the app
    this.bridge.invoke('conversation:updated', message.conversationId);
  }
}
```

### Type-Safe Bridge Usage

```typescript
// hooks/useBridge.ts
import { useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/services/ServiceFactory';

export function useBridge() {
  const bridge = ServiceFactory.getBridgeService();

  const invoke = useCallback(
    async <T>(channel: string, ...args: any[]): Promise<T> => {
      return bridge.invoke<T>(channel, ...args);
    },
    [bridge],
  );

  const on = useCallback(
    (channel: string, handler: Function) => {
      bridge.on(channel, handler);
      return () => bridge.off(channel, handler);
    },
    [bridge],
  );

  return { invoke, on };
}
```

### Database Operation Flow

```
UI Action → Store Action → IPC Call → Main Process → SQLite → Response
                ↓                           ↓            ↓        ↓
            Update UI ← Update Store ← Transform ← Raw Data ←
```

### Settings Management Flow

```typescript
// Settings update flow
1. User changes setting in UI
2. Update local state (optimistic)
3. IPC call to save setting
4. Main process updates JSON/keychain
5. Confirmation or rollback on error
```

## Event Flow Architecture

### Agent Event Bus Integration

```typescript
// Central event coordination
class EventCoordinator {
  constructor() {
    // Agent events
    agentEvents.on('agent:thinking', this.handleAgentThinking);
    agentEvents.on('agent:responded', this.handleAgentResponse);
    agentEvents.on('agent:error', this.handleAgentError);

    // UI events
    uiEvents.on('mode:changed', this.handleModeChange);
    uiEvents.on('agent:added', this.handleAgentAdded);
  }

  private handleAgentResponse = data => {
    const store = useStore.getState();

    if (store.autoMode) {
      // Trigger next agent after delay
      setTimeout(() => {
        this.triggerNextAgent();
      }, store.settings.responseDelay * 1000);
    }
  };
}
```

### Concurrent Operations Handling

```typescript
// Manual mode parallel responses
class ParallelResponseManager {
  private pendingResponses = new Map<AgentId, Promise<string>>();

  async generateAllResponses(agents: Agent[], messages: Message[]) {
    // Start all agents simultaneously
    const responsePromises = agents.map(agent => ({
      agentId: agent.id,
      promise: this.generateAgentResponse(agent, messages),
    }));

    // Track each as it completes
    for (const { agentId, promise } of responsePromises) {
      promise
        .then(response => {
          useStore.getState().actions.addPendingResponse(agentId, response);
        })
        .catch(error => {
          useStore.getState().actions.setAgentError(agentId, error);
        });
    }

    // Wait for all to complete or error
    await Promise.allSettled(responsePromises.map(r => r.promise));
    useStore.getState().actions.enableResponseSubmission();
  }
}
```

## Error Handling Patterns

### Component Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ChatErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat error:', error, errorInfo);
    this.setState({ hasError: true, error });

    // Report to error service
    errorReporter.logError(error, { component: 'Chat', ...errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
```

### Global Error Handler

```typescript
// services/error-handler.ts
class ErrorHandler {
  handle(error: Error, context?: any) {
    console.error('Application error:', error, context);

    // Categorize error
    if (error.message.includes('rate limit')) {
      this.handleRateLimit(error);
    } else if (error.message.includes('API key')) {
      this.handleAuthError(error);
    } else if (error.message.includes('network')) {
      this.handleNetworkError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  private handleRateLimit(error: Error) {
    useStore.getState().actions.pauseAutoMode();
    toast.error('Rate limit reached. Please wait before continuing.', {
      duration: 10000,
    });
  }
}
```

## Performance Optimizations

### State Update Batching

```typescript
// Batch multiple rapid updates
const { addMessages } = useStore(state => ({
  addMessages: state.actions.addMessages,
}));

// Instead of multiple individual updates
messages.forEach(msg => addMessage(msg)); // ❌

// Batch them together
addMessages(messages); // ✅
```

### Debounced Operations

```typescript
// utils/debounce.ts
export const debouncedSave = debounce(
  async (conversation: Conversation) => {
    await api.db.saveConversation(conversation);
  },
  1000, // Save at most once per second
);

// Usage in components
useEffect(() => {
  debouncedSave(conversation);
}, [conversation]);
```

### Memory Management

```typescript
// services/conversation/memory-manager.ts
class MemoryManager {
  private readonly MAX_RENDERED_MESSAGES = 100;

  getVisibleMessages(allMessages: Message[]): Message[] {
    if (allMessages.length <= this.MAX_RENDERED_MESSAGES) {
      return allMessages;
    }

    // Keep recent messages + use virtual scrolling for rest
    return allMessages.slice(-this.MAX_RENDERED_MESSAGES);
  }

  // Clean up old conversation data
  cleanupInactiveConversations() {
    const store = useStore.getState();
    const inactiveThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days

    store.conversations
      .filter(c => c.id !== store.activeConversationId && c.updatedAt < inactiveThreshold)
      .forEach(c => this.unloadConversation(c.id));
  }
}
```

## Data Validation Patterns

### UI Layer Validation

```typescript
// components/AgentConfig/validations.ts
export const validateAgentConfig = (config: Partial<AgentConfig>) => {
  const errors: ValidationErrors = {};

  if (!config.name?.trim()) {
    errors.name = 'Agent name is required';
  }

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2';
    }
  }

  return errors;
};
```

### Service Layer Validation

```typescript
// services/ai/validation.ts
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  agentId: z.string().optional(),
});

export function validateMessage(message: unknown): Message {
  return MessageSchema.parse(message);
}
```

### IPC Boundary Validation

```typescript
// main/ipc/handlers.ts
ipcMain.handle('db:saveMessage', async (event, rawMessage) => {
  // Validate incoming data
  const validated = validateIpcInput(rawMessage, MessageSchema);

  // Process with confidence
  return await database.saveMessage(validated);
});
```

## Real-time Synchronization

### Message Streaming Updates

```typescript
// Efficient streaming updates
class StreamingMessage {
  private content = '';
  private updateQueue: string[] = [];
  private rafId: number | null = null;

  addChunk(chunk: string) {
    this.updateQueue.push(chunk);
    this.scheduleUpdate();
  }

  private scheduleUpdate() {
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      // Batch all pending chunks in one update
      this.content += this.updateQueue.join('');
      this.updateQueue = [];
      this.rafId = null;

      // Update UI
      this.onUpdate?.(this.content);
    });
  }
}
```

### Auto Mode Coordination

```typescript
// services/conversation/auto-mode-coordinator.ts
class AutoModeCoordinator {
  private isRunning = false;
  private stopRequested = false;

  async start() {
    this.isRunning = true;
    this.stopRequested = false;

    while (this.isRunning && !this.stopRequested) {
      const nextAgent = this.turnManager.getNextAgent();

      if (!nextAgent || this.checkStopConditions()) {
        this.stop();
        break;
      }

      await this.processAgentTurn(nextAgent);
      await this.delay(this.settings.responseDelay);
    }
  }

  stop() {
    this.isRunning = false;
    this.stopRequested = true;
    useStore.getState().actions.setAutoMode(false);
  }
}
```

## Integration Patterns Summary

### Key Principles

1. **Unidirectional data flow**: UI → Store → Services → APIs
2. **Clear separation**: UI logic vs business logic vs data access
3. **Type safety**: Throughout the entire stack
4. **Error resilience**: Graceful degradation at each layer
5. **Performance first**: Batch, debounce, and optimize by default

### Best Practices

- Always validate at boundaries (UI, service, IPC)
- Use abort signals for cancellable operations
- Stream responses for better UX
- Handle errors at appropriate levels
- Keep state updates predictable and traceable
