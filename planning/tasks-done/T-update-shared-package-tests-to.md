---
kind: task
id: T-update-shared-package-tests-to
title: Update shared package tests to use ViewModel naming for core UI types
status: done
priority: normal
prerequisites:
  - T-rename-agent-interface-to
  - T-rename-message-interface-to
  - T-rename-conversation-interface-to
created: "2025-07-30T01:46:39.710073"
updated: "2025-07-30T01:46:39.710073"
schema_version: "1.1"
---

# Update Shared Package Tests to Use ViewModel Naming for Core UI Types

## Context and Purpose

Update all test files in the shared package (`packages/shared/`) to use the new ViewModel names instead of the deprecated legacy names. This ensures comprehensive migration and consistent naming throughout the shared package tests.

## Implementation Steps

### 1. Find all test files using UI core types

**Search locations**:

- `packages/shared/src/types/__tests__/`
- `packages/shared/src/types/ui/__tests__/` (if exists)
- Any `*.test.ts` or `*.test.tsx` files in shared package
- Any test helper/utility files

### 2. Update test imports and type annotations

**Pattern for Agent types**:

```typescript
// From
import { Agent } from "../ui/core/Agent"
const testAgent: Agent = { ... }

// To
import { AgentViewModel } from "../ui/core/Agent"
const testAgent: AgentViewModel = { ... }
```

**Pattern for Message types**:

```typescript
// From
import { Message } from "../ui/core/Message"
const testMessage: Message = { ... }

// To
import { MessageViewModel } from "../ui/core/Message"
const testMessage: MessageViewModel = { ... }
```

**Pattern for Conversation types**:

```typescript
// From
import { Conversation } from "../ui/core/Conversation"
const testConversation: Conversation = { ... }

// To
import { ConversationViewModel } from "../ui/core/Conversation"
const testConversation: ConversationViewModel = { ... }
```

### 3. Update test data builders and mock objects

**Update mock creators**:

```typescript
// From
const createTestAgent = (): Agent => ({
  name: "Test Agent",
  role: "Test Role",
  color: "#ffffff",
  isThinking: false,
});

// To
const createTestAgentViewModel = (): AgentViewModel => ({
  name: "Test Agent",
  role: "Test Role",
  color: "#ffffff",
  isThinking: false,
});
```

### 4. Update test descriptions and comments

- Update test descriptions to reflect ViewModel naming
- Update comments that reference the old type names
- Ensure test documentation is consistent with new naming

### 5. Build and validate all tests

- Run `pnpm build:libs` to rebuild shared package
- Run `pnpm test` in shared package to ensure all tests pass
- Run `pnpm quality` to check for any TypeScript errors

## Acceptance Criteria

### Functional Requirements

- ✅ All test files use ViewModel naming for imports and type annotations
- ✅ All test data builders updated to use ViewModel types
- ✅ All mock objects use ViewModel naming
- ✅ Test descriptions and comments updated consistently

### Technical Requirements

- ✅ All shared package tests pass (`pnpm test`)
- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ No TypeScript compilation errors in test files

### Code Quality Requirements

- ✅ Consistent ViewModel naming throughout test files
- ✅ Test helpers and utilities use ViewModel types
- ✅ No remaining references to deprecated legacy type names in tests

## Search Commands for Implementation

```bash
# Find test files with UI type usage
find packages/shared -name "*.test.ts" -o -name "*.test.tsx" | xargs grep -l "Agent\|Message\|Conversation"

# Search for specific type usage in tests
grep -r "Agent\|Message\|Conversation" --include="*.test.ts" --include="*.test.tsx" packages/shared/
```

## Time Estimate

**Total: 60 minutes**

- Search and catalog test file usage: 20 minutes
- Update test imports and type annotations: 25 minutes
- Update test descriptions and comments: 10 minutes
- Build validation and testing: 5 minutes

### Log
