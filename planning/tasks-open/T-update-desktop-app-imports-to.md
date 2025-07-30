---
kind: task
id: T-update-desktop-app-imports-to
title: Update desktop app imports to use ViewModel naming for core UI types
status: open
priority: normal
prerequisites:
  - T-rename-agent-interface-to
  - T-rename-message-interface-to
  - T-rename-conversation-interface-to
created: "2025-07-30T01:46:21.978024"
updated: "2025-07-30T01:46:21.978024"
schema_version: "1.1"
---

# Update Desktop App Imports to Use ViewModel Naming for Core UI Types

## Context and Purpose

Update all import statements and type annotations in the desktop app (`apps/desktop/`) to use the new ViewModel names instead of the deprecated legacy names. This completes the migration to explicit ViewModel naming convention.

## Implementation Steps

### 1. Find and update Agent type usage

**Files to update**: All files in `apps/desktop/` that import or use `Agent` from `@fishbowl-ai/shared`

Key locations identified:

- `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`
- Any component props or type annotations using `Agent`

**Update pattern**:

```typescript
// From
import { Agent } from "@fishbowl-ai/shared"
const agent: Agent = { ... }

// To
import { AgentViewModel } from "@fishbowl-ai/shared"
const agent: AgentViewModel = { ... }
```

### 2. Find and update Message type usage

**Search for**: All occurrences of `Message` type imports and usage from `@fishbowl-ai/shared`

**Update pattern**:

```typescript
// From
import { Message } from "@fishbowl-ai/shared"
const message: Message = { ... }

// To
import { MessageViewModel } from "@fishbowl-ai/shared"
const message: MessageViewModel = { ... }
```

### 3. Find and update Conversation type usage

**Search for**: All occurrences of `Conversation` type imports and usage from `@fishbowl-ai/shared`

**Update pattern**:

```typescript
// From
import { Conversation } from "@fishbowl-ai/shared"
const conversation: Conversation = { ... }

// To
import { ConversationViewModel } from "@fishbowl-ai/shared"
const conversation: ConversationViewModel = { ... }
```

### 4. Update component props and interfaces

**Update any interfaces** that use these types:

```typescript
// From
interface AgentPillProps {
  agent: Agent;
}

// To
interface AgentPillProps {
  agent: AgentViewModel;
}
```

### 5. Update test files

**Search for test files** in `apps/desktop/` that use these types and update them:

- `*.test.ts` and `*.test.tsx` files
- Test data builders and mock objects

### 6. Build and validate changes

- Run `pnpm build:libs` to rebuild shared package
- Run `pnpm quality` to check for type errors
- Run `pnpm test` to ensure tests pass
- Verify no compilation errors in desktop app

## Acceptance Criteria

### Functional Requirements

- ✅ All imports of `Agent`, `Message`, `Conversation` updated to ViewModel variants
- ✅ All type annotations updated to use ViewModel names
- ✅ All component interfaces updated to use ViewModel types
- ✅ All test files updated to use ViewModel types

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ All tests pass (`pnpm test`)
- ✅ No TypeScript compilation errors in desktop app
- ✅ Desktop app functionality unchanged

### Code Quality Requirements

- ✅ Consistent ViewModel naming throughout desktop app
- ✅ No remaining references to deprecated legacy type names
- ✅ Import statements clean and consistent

## Search Commands for Implementation

```bash
# Find Agent usage
grep -r "Agent.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/desktop/

# Find Message usage
grep -r "Message.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/desktop/

# Find Conversation usage
grep -r "Conversation.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/desktop/
```

## Time Estimate

**Total: 90 minutes**

- Search and catalog all usage: 30 minutes
- Update import statements and type annotations: 45 minutes
- Build validation and testing: 15 minutes

### Log
