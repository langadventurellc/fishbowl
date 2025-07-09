# IPC API Documentation

## Overview

This document describes the Inter-Process Communication (IPC) API for the Fishbowl Electron application. The IPC system provides secure, type-safe communication between the main process, preload script, and renderer process.

## Architecture

### Process Separation

- **Main Process**: Handles system operations, database (SQLite), secure storage (keytar), file system access
- **Preload Script**: Acts as a secure bridge between main and renderer processes
- **Renderer Process**: React UI that consumes the IPC API through the preload bridge

### Security Model

- Context isolation enabled
- Input validation and sanitization
- Type-safe communication
- Performance monitoring
- Error recovery mechanisms

## API Reference

### Database Operations

#### Agents

**Create Agent**

```typescript
window.electronAPI.database.agents.create({
  name: string;
  systemPrompt: string;
  description?: string;
}) => Promise<{ success: boolean; data?: Agent; error?: ErrorInfo }>
```

**Get Agent**

```typescript
window.electronAPI.database.agents.get({
  id: string;
}) => Promise<{ success: boolean; data?: Agent; error?: ErrorInfo }>
```

**List Agents**

```typescript
window.electronAPI.database.agents.list(
  filter?: DatabaseFilter
) => Promise<{ success: boolean; data?: Agent[]; error?: ErrorInfo }>
```

**Update Agent**

```typescript
window.electronAPI.database.agents.update({
  id: string;
  name?: string;
  systemPrompt?: string;
  description?: string;
  isActive?: boolean;
}) => Promise<{ success: boolean; data?: Agent; error?: ErrorInfo }>
```

**Delete Agent**

```typescript
window.electronAPI.database.agents.delete({
  id: string;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

#### Conversations

**Create Conversation**

```typescript
window.electronAPI.database.conversations.create({
  title: string;
  description?: string;
}) => Promise<{ success: boolean; data?: Conversation; error?: ErrorInfo }>
```

**Get Conversation**

```typescript
window.electronAPI.database.conversations.get({
  id: string;
}) => Promise<{ success: boolean; data?: Conversation; error?: ErrorInfo }>
```

**List Conversations**

```typescript
window.electronAPI.database.conversations.list(
  filter?: DatabaseFilter
) => Promise<{ success: boolean; data?: Conversation[]; error?: ErrorInfo }>
```

**Update Conversation**

```typescript
window.electronAPI.database.conversations.update({
  id: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}) => Promise<{ success: boolean; data?: Conversation; error?: ErrorInfo }>
```

**Delete Conversation**

```typescript
window.electronAPI.database.conversations.delete({
  id: string;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

#### Messages

**Create Message**

```typescript
window.electronAPI.database.messages.create({
  conversationId: string;
  agentId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
}) => Promise<{ success: boolean; data?: Message; error?: ErrorInfo }>
```

**Get Message**

```typescript
window.electronAPI.database.messages.get({
  id: string;
}) => Promise<{ success: boolean; data?: Message; error?: ErrorInfo }>
```

**List Messages**

```typescript
window.electronAPI.database.messages.list({
  conversationId: string;
  filter?: DatabaseFilter;
}) => Promise<{ success: boolean; data?: Message[]; error?: ErrorInfo }>
```

**Delete Message**

```typescript
window.electronAPI.database.messages.delete({
  id: string;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

#### Transaction Operations

**Create Conversation with Agents**

```typescript
window.electronAPI.database.transactions.createConversationWithAgents({
  conversation: {
    title: string;
    description?: string;
  };
  agentIds: string[];
}) => Promise<{ success: boolean; data?: { conversation: Conversation; agentCount: number }; error?: ErrorInfo }>
```

**Create Messages Batch**

```typescript
window.electronAPI.database.transactions.createMessagesBatch({
  conversationId: string;
  messages: Array<{
    agentId: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
  }>;
}) => Promise<{ success: boolean; data?: { messages: Message[]; conversationUpdated: boolean }; error?: ErrorInfo }>
```

**Delete Conversation Cascade**

```typescript
window.electronAPI.database.transactions.deleteConversationCascade({
  conversationId: string;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

### Secure Storage Operations

#### Keytar Operations

**Get Password**

```typescript
window.electronAPI.secure.keytar.get({
  service: string;
  account: string;
}) => Promise<{ success: boolean; data?: string | null; error?: ErrorInfo }>
```

**Set Password**

```typescript
window.electronAPI.secure.keytar.set({
  service: string;
  account: string;
  password: string;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

**Delete Password**

```typescript
window.electronAPI.secure.keytar.delete({
  service: string;
  account: string;
}) => Promise<{ success: boolean; data?: boolean; error?: ErrorInfo }>
```

#### Credential Management

**Get Credentials**

```typescript
window.electronAPI.secure.credentials.get({
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama';
}) => Promise<{ success: boolean; data?: CredentialInfo; error?: ErrorInfo }>
```

**Set Credentials**

```typescript
window.electronAPI.secure.credentials.set({
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama';
  apiKey: string;
  metadata?: Record<string, unknown>;
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

**List Credentials**

```typescript
window.electronAPI.secure.credentials.list() => Promise<{ success: boolean; data?: CredentialInfo[]; error?: ErrorInfo }>
```

**Delete Credentials**

```typescript
window.electronAPI.secure.credentials.delete({
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama';
}) => Promise<{ success: boolean; error?: ErrorInfo }>
```

### System Operations

**Get System Information**

```typescript
window.electronAPI.system.getInfo() => Promise<{ success: boolean; data?: SystemInfo; error?: ErrorInfo }>
```

**Get Platform**

```typescript
window.electronAPI.system.platform() => Promise<{ success: boolean; data?: string; error?: ErrorInfo }>
```

**Get Architecture**

```typescript
window.electronAPI.system.arch() => Promise<{ success: boolean; data?: string; error?: ErrorInfo }>
```

**Get Version**

```typescript
window.electronAPI.system.version() => Promise<{ success: boolean; data?: string; error?: ErrorInfo }>
```

### Configuration Operations

**Get Configuration**

```typescript
window.electronAPI.config.get(key: string) => Promise<{ success: boolean; data?: unknown; error?: ErrorInfo }>
```

**Set Configuration**

```typescript
window.electronAPI.config.set(key: string, value: unknown) => Promise<{ success: boolean; error?: ErrorInfo }>
```

### Theme Operations

**Get Theme**

```typescript
window.electronAPI.theme.get() => Promise<{ success: boolean; data?: string; error?: ErrorInfo }>
```

**Set Theme**

```typescript
window.electronAPI.theme.set(theme: string) => Promise<{ success: boolean; error?: ErrorInfo }>
```

### Window Operations

**Minimize Window**

```typescript
window.electronAPI.window.minimize() => Promise<{ success: boolean; error?: ErrorInfo }>
```

**Maximize Window**

```typescript
window.electronAPI.window.maximize() => Promise<{ success: boolean; error?: ErrorInfo }>
```

**Close Window**

```typescript
window.electronAPI.window.close() => Promise<{ success: boolean; error?: ErrorInfo }>
```

### Performance Monitoring

**Get Performance Stats**

```typescript
window.electronAPI.performance.getStats() => Promise<IpcPerformanceStats>
```

**Get Performance Metrics**

```typescript
window.electronAPI.performance.getMetrics() => Promise<Record<string, IpcPerformanceMetrics>>
```

**Get Slow Calls**

```typescript
window.electronAPI.performance.getSlowCalls() => Promise<Array<{ channel: string; slowCallCount: number; averageTime: number }>>
```

### Security Operations

**Get Audit Log**

```typescript
window.electronAPI.security.getAuditLog() => Promise<SecurityAuditEntry[]>
```

**Get Security Stats**

```typescript
window.electronAPI.security.getSecurityStats() => Promise<SecurityStats>
```

## Error Handling

### Error Types

All IPC operations return a standardized response format:

```typescript
interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
}

interface ErrorInfo {
  type:
    | 'VALIDATION'
    | 'DATABASE'
    | 'SECURE_STORAGE'
    | 'IPC'
    | 'SYSTEM'
    | 'NOT_FOUND'
    | 'CONSTRAINT'
    | 'PERMISSION'
    | 'RATE_LIMITED';
  message: string;
  details?: Record<string, unknown>;
}
```

### Error Recovery

The IPC system includes automatic error recovery mechanisms:

- **Circuit Breaker**: Prevents cascading failures
- **Retry Logic**: Automatically retries failed operations
- **Graceful Degradation**: Falls back to alternative operations
- **Fallback Services**: Provides alternative implementations

## Performance Features

### Monitoring

- **Call Tracking**: Monitors all IPC calls with timing metrics
- **Slow Call Detection**: Identifies operations exceeding performance thresholds
- **Memory Usage**: Tracks memory consumption per operation
- **Success/Failure Rates**: Monitors operation reliability

### Optimization

- **Caching**: Caches frequently accessed data
- **Batching**: Groups related operations for efficiency
- **Connection Pooling**: Reuses database connections
- **Lazy Loading**: Loads data only when needed

## Security Features

### Input Validation

- **Schema Validation**: All inputs validated against Zod schemas
- **Sanitization**: Strings sanitized to prevent injection attacks
- **Type Checking**: Strict TypeScript typing enforced
- **Rate Limiting**: Prevents abuse through request throttling

### Access Control

- **Context Isolation**: Renderer process isolated from main process
- **Secure Bridge**: Preload script provides controlled access
- **Permission Checks**: Operations validated against user permissions
- **Audit Logging**: All operations logged for security review

## Usage Examples

### Basic Agent Management

```typescript
// Create a new agent
const createResult = await window.electronAPI.database.agents.create({
  name: 'Assistant',
  systemPrompt: 'You are a helpful assistant',
  description: 'General purpose assistant',
});

if (createResult.success) {
  const agent = createResult.data;
  console.log('Agent created:', agent.id);
} else {
  console.error('Failed to create agent:', createResult.error);
}

// List all agents
const listResult = await window.electronAPI.database.agents.list();
if (listResult.success) {
  const agents = listResult.data;
  console.log('Found agents:', agents.length);
}
```

### Conversation Management

```typescript
// Create conversation with agents
const result = await window.electronAPI.database.transactions.createConversationWithAgents({
  conversation: {
    title: 'Planning Session',
    description: 'Discuss project planning',
  },
  agentIds: ['agent-1', 'agent-2'],
});

if (result.success) {
  const { conversation, agentCount } = result.data;
  console.log(`Created conversation with ${agentCount} agents`);
}
```

### Secure Credential Storage

```typescript
// Store API credentials
await window.electronAPI.secure.credentials.set({
  provider: 'openai',
  apiKey: 'sk-...',
  metadata: {
    displayName: 'OpenAI Production',
    environment: 'production',
  },
});

// Retrieve credentials
const credResult = await window.electronAPI.secure.credentials.get({
  provider: 'openai',
});

if (credResult.success && credResult.data) {
  console.log('API key available:', credResult.data.hasApiKey);
}
```

### Error Handling Patterns

```typescript
async function safelyCreateAgent(agentData) {
  try {
    const result = await window.electronAPI.database.agents.create(agentData);

    if (!result.success) {
      switch (result.error?.type) {
        case 'VALIDATION':
          throw new Error(`Invalid input: ${result.error.message}`);
        case 'DATABASE':
          throw new Error('Database error occurred');
        case 'CONSTRAINT':
          throw new Error('Agent with this name already exists');
        default:
          throw new Error('Unknown error occurred');
      }
    }

    return result.data;
  } catch (error) {
    console.error('Agent creation failed:', error);
    throw error;
  }
}
```

## React Hook Integration

### useAgents Hook

```typescript
import { useAgents } from '@/hooks/useAgents';

function AgentList() {
  const { agents, loading, error, createAgent, deleteAgent } = useAgents();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          <button onClick={() => deleteAgent(agent.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### useSecureStorage Hook

```typescript
import { useSecureStorage } from '@/hooks/useSecureStorage';

function SettingsPage() {
  const { setCredentials, getCredentials, loading, error } = useSecureStorage();

  const handleSaveCredentials = async (provider, apiKey) => {
    await setCredentials(provider, { apiKey }, { displayName: 'My API Key' });
  };

  return (
    <div>
      {/* Credential management UI */}
    </div>
  );
}
```

## Best Practices

### Error Handling

1. Always check the `success` property before accessing `data`
2. Handle specific error types appropriately
3. Provide meaningful error messages to users
4. Log errors for debugging purposes

### Performance

1. Use batch operations when possible
2. Cache frequently accessed data
3. Implement proper loading states
4. Monitor performance metrics

### Security

1. Never store sensitive data in the renderer process
2. Validate all user inputs
3. Use the secure storage API for credentials
4. Regularly audit access patterns

### Development

1. Use TypeScript for type safety
2. Test error scenarios thoroughly
3. Monitor IPC performance in development
4. Use React hooks for state management

## Migration Guide

### From Direct IPC to Hooks

**Before:**

```typescript
// Direct IPC call
const result = await window.electronAPI.database.agents.list();
```

**After:**

```typescript
// Using React hook
const { agents, loading, error } = useAgents();
```

### Error Handling Updates

**Before:**

```typescript
try {
  const result = await window.electronAPI.database.agents.create(data);
  // Handle result
} catch (error) {
  // Handle error
}
```

**After:**

```typescript
const result = await window.electronAPI.database.agents.create(data);
if (result.success) {
  // Handle success
} else {
  // Handle error with result.error
}
```

## Troubleshooting

### Common Issues

1. **Context Isolation Errors**: Ensure preload script is properly loaded
2. **Type Errors**: Check TypeScript definitions are up to date
3. **Performance Issues**: Use performance monitoring API to identify bottlenecks
4. **Security Errors**: Verify input validation and sanitization

### Debug Tools

1. **Performance Monitor**: Check slow operations
2. **Security Audit**: Review access patterns
3. **Error Logging**: Monitor IPC errors
4. **Development Tools**: Use Electron DevTools for debugging

## API Changes

### Version History

- **v1.0.0**: Initial IPC API implementation
- **v1.1.0**: Added performance monitoring
- **v1.2.0**: Added error recovery mechanisms
- **v1.3.0**: Added security auditing
- **v1.4.0**: Added integration tests and documentation

### Breaking Changes

None in current version.

### Deprecations

None in current version.

## Support

For issues or questions about the IPC API:

1. Check the integration tests for usage examples
2. Review the technical documentation
3. Use the performance monitoring tools for debugging
4. Refer to the error handling patterns above

---

_This documentation is automatically generated from the IPC system implementation. Last updated: $(date)_
