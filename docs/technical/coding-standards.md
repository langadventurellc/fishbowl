# Coding Standards & Conventions

This document defines the coding standards and conventions for the Fishbowl project to ensure consistency, maintainability, and quality across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Standards](#react-standards)
- [CSS/Styling Standards](#cssstyling-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Documentation](#code-documentation)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Tools & Configuration](#tools--configuration)

## General Principles

### Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns throughout the codebase
- **Maintainability**: Write code that is easy to modify and extend
- **Performance**: Consider performance implications of code decisions
- **Security**: Follow security best practices, especially for API key handling

### Development Workflow

- Use strict TypeScript mode
- Run linting and type checking before commits
- Write tests for new functionality
- Update documentation with code changes
- Follow conventional commit messages

## TypeScript Standards

### Configuration

- Use `strict: true` in TypeScript configuration
- Enable all strict type checking options
- Use `noImplicitAny: true` to prevent implicit any types

### Type Definitions

```typescript
// ✅ Good: Explicit types for function parameters and return values
function processMessage(message: string, userId: number): Promise<ProcessedMessage> {
  // Implementation
}

// ❌ Bad: Implicit any types
function processMessage(message, userId) {
  // Implementation
}
```

### Interfaces vs Types

```typescript
// ✅ Good: Use interfaces for object shapes
interface Agent {
  id: string;
  name: string;
  personality: PersonalityConfig;
  role: RoleConfig;
}

// ✅ Good: Use types for unions and computed types
type MessageStatus = 'pending' | 'sent' | 'failed';
type AgentWithStatus = Agent & { status: MessageStatus };
```

### Generic Types

```typescript
// ✅ Good: Use descriptive generic names
interface Store<TState, TActions> {
  state: TState;
  actions: TActions;
}

// ❌ Bad: Single letter generics without context
interface Store<T, U> {
  state: T;
  actions: U;
}
```

### Null and Undefined

```typescript
// ✅ Good: Use strict null checks
function findAgent(id: string): Agent | null {
  return agents.find(agent => agent.id === id) || null;
}

// ✅ Good: Use optional chaining
const agentName = agent?.name ?? 'Unknown';
```

## React Standards

### Component Structure

```typescript
// ✅ Good: Functional component with props interface
interface ChatMessageProps {
  message: Message;
  agent: Agent;
  onReply?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  agent,
  onReply
}) => {
  // Component logic
  return (
    <div className={styles.message}>
      {/* JSX */}
    </div>
  );
};
```

### Hooks Usage

```typescript
// ✅ Good: Custom hooks for shared logic
function useAgent(agentId: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agent logic
  }, [agentId]);

  return { agent, loading };
}
```

### State Management

```typescript
// ✅ Good: Zustand store with TypeScript
interface AgentStore {
  agents: Agent[];
  activeAgent: Agent | null;
  addAgent: (agent: Agent) => void;
  setActiveAgent: (agent: Agent) => void;
}

const useAgentStore = create<AgentStore>(set => ({
  agents: [],
  activeAgent: null,
  addAgent: agent =>
    set(state => ({
      agents: [...state.agents, agent],
    })),
  setActiveAgent: agent => set({ activeAgent: agent }),
}));
```

### Store Import Patterns

```typescript
// ✅ Good: Relative imports for store modules
import { useAppStore } from './store';
import { useThemeStore } from './slices/theme';
import { useAgentStore } from './slices/agents';

// ✅ Good: Store composition with TypeScript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// ✅ Good: Component usage with store
import { useThemeStore } from '../store/slices/theme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
};
```

### Event Handling

```typescript
// ✅ Good: Properly typed event handlers
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Handle form submission
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

## CSS/Styling Standards

### CSS Modules

```typescript
// ✅ Good: CSS Modules with TypeScript
import styles from './ChatMessage.module.css';

const ChatMessage = () => (
  <div className={styles.message}>
    <div className={styles.messageHeader}>
      <span className={styles.agentName}>Agent Name</span>
    </div>
    <div className={styles.messageContent}>
      Content
    </div>
  </div>
);
```

### CSS Variables for Theming

```css
/* ✅ Good: CSS variables for theming */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --spacing-unit: 0.5rem;
}

[data-theme='dark'] {
  --color-background: #1f2937;
  --color-text: #f9fafb;
}
```

### BEM Methodology

```css
/* ✅ Good: BEM naming convention */
.chatMessage {
  display: flex;
  flex-direction: column;
}

.chatMessage__header {
  display: flex;
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.chatMessage__header--highlighted {
  background-color: var(--color-primary);
}

.chatMessage__agentName {
  font-weight: 600;
  color: var(--color-text);
}
```

## File Organization

### Directory Structure

```
src/
├── main/                           # Electron main process
│   ├── database/
│   │   ├── migrations/
│   │   ├── models/
│   │   └── index.ts
│   ├── config/
│   │   ├── ConfigManager.ts
│   │   └── index.ts
│   ├── security/
│   │   ├── KeyManager.ts
│   │   └── index.ts
│   └── ipc/
│       ├── handlers/
│       └── index.ts
├── renderer/                       # React application
│   ├── components/
│   │   ├── ChatRoom/
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── ChatRoom.module.css
│   │   │   ├── MessageList.tsx
│   │   │   └── index.ts
│   │   └── common/
│   ├── store/
│   │   ├── agentStore.ts
│   │   ├── chatStore.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAgent.ts
│   │   └── index.ts
│   └── services/
│       ├── ai/
│       │   ├── providers/
│       │   └── index.ts
│       └── index.ts
└── shared/                         # Shared types and utilities
    ├── types/
    │   ├── agent.ts
    │   ├── message.ts
    │   ├── ipc.ts
    │   └── index.ts
    └── utils/
        └── index.ts
```

### Component Organization

```typescript
// ✅ Good: Feature-based component organization
// ChatRoom/index.ts
export { ChatRoom } from './ChatRoom';
export { MessageList } from './MessageList';
export type { ChatRoomProps } from './ChatRoom';

// ChatRoom/ChatRoom.tsx
import { MessageList } from './MessageList';
import styles from './ChatRoom.module.css';

export interface ChatRoomProps {
  // Props definition
}

export const ChatRoom: React.FC<ChatRoomProps> = props => {
  // Component implementation
};
```

## Naming Conventions

### Files and Directories

```
✅ Good:
- ChatRoom.tsx (PascalCase for components)
- useAgent.ts (camelCase for hooks)
- agentStore.ts (camelCase for stores)
- agent.types.ts (descriptive names)
- ChatRoom.module.css (CSS modules)

❌ Bad:
- chatroom.tsx
- UseAgent.ts
- AgentStore.ts
- types.ts
- styles.css
```

### Variables and Functions

```typescript
// ✅ Good: Descriptive camelCase names
const activeAgentId = 'agent-123';
const messageHistory = [];

const handleMessageSubmit = () => {
  /* */
};
const fetchAgentConfiguration = () => {
  /* */
};

// ❌ Bad: Unclear or inconsistent names
const id = 'agent-123';
const msgs = [];

const handleSubmit = () => {
  /* */
};
const getConfig = () => {
  /* */
};
```

### Constants

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for constants
const MAX_MESSAGE_LENGTH = 1000;
const DEFAULT_PERSONALITY_CONFIG = {
  openness: 0.5,
  conscientiousness: 0.7,
  extraversion: 0.6,
  agreeableness: 0.8,
  neuroticism: 0.3,
};

// ✅ Good: Enums for related constants
enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
```

## Code Documentation

### JSDoc Comments

```typescript
/**
 * Generates a response from an AI agent based on the conversation context
 * @param agent - The agent configuration
 * @param messages - The conversation history
 * @param options - Additional options for response generation
 * @returns Promise resolving to the generated response
 */
async function generateAgentResponse(
  agent: Agent,
  messages: Message[],
  options: ResponseOptions = {},
): Promise<AgentResponse> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good: Explain complex logic
const personalityPrompt = buildPersonalityPrompt(agent.personality);
// Combine system prompt with personality adjustments to ensure consistent behavior
const systemPrompt = `${agent.role.systemPrompt}\n\n${personalityPrompt}`;

// ❌ Bad: State the obvious
const name = agent.name; // Get the agent name
```

## Error Handling

### Error Types

```typescript
// ✅ Good: Custom error types
class AgentConfigurationError extends Error {
  constructor(
    message: string,
    public agentId: string,
  ) {
    super(message);
    this.name = 'AgentConfigurationError';
  }
}

class APIConnectionError extends Error {
  constructor(
    message: string,
    public provider: string,
  ) {
    super(message);
    this.name = 'APIConnectionError';
  }
}
```

### Error Handling Patterns

```typescript
// ✅ Good: Proper error handling with types
async function createAgent(config: AgentConfig): Promise<Agent> {
  try {
    const agent = await processAgentConfig(config);
    return agent;
  } catch (error) {
    if (error instanceof AgentConfigurationError) {
      // Handle configuration errors
      throw new Error(`Failed to create agent: ${error.message}`);
    }
    // Re-throw unknown errors
    throw error;
  }
}
```

## Testing Standards

### Test Structure

```typescript
// ✅ Good: Descriptive test structure
describe('AgentStore', () => {
  beforeEach(() => {
    // Setup
  });

  describe('addAgent', () => {
    it('should add a new agent to the store', () => {
      // Test implementation
    });

    it('should throw error when agent ID already exists', () => {
      // Test implementation
    });
  });

  describe('removeAgent', () => {
    it('should remove agent from store', () => {
      // Test implementation
    });

    it('should handle removing non-existent agent', () => {
      // Test implementation
    });
  });
});
```

### Mock Usage

```typescript
// ✅ Good: Proper mocking
vi.mock('../services/ai/providers/openai', () => ({
  OpenAIProvider: vi.fn().mockImplementation(() => ({
    generateResponse: vi.fn().mockResolvedValue({
      content: 'Mock response',
      usage: { tokens: 100 }
    }))
  }))
}));
```

## Tools & Configuration

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Code Review Checklist

- [ ] Code follows TypeScript strict mode requirements
- [ ] All functions have proper type annotations
- [ ] React components use proper prop interfaces
- [ ] CSS follows BEM methodology and uses CSS variables
- [ ] File and directory naming follows conventions
- [ ] Code is properly documented with JSDoc where needed
- [ ] Error handling is implemented appropriately
- [ ] Tests are written for new functionality
- [ ] No security vulnerabilities (API keys, etc.)
- [ ] Performance considerations are addressed

---

_This document should be updated as the project evolves and new patterns are established._
