---
id: F-simple-shared-utilities
title: Simple Shared Utilities
status: open
priority: medium
parent: E-persistence-layer-and-state
prerequisites:
  - F-state-store-with-auto-save
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-16T20:59:26.503Z
updated: 2025-08-16T20:59:26.503Z
---

# Simple Shared Utilities

## Purpose

Extract minimal common patterns from the roles and personalities stores into simple, focused utilities. This reduces code duplication without over-engineering or creating complex abstractions.

## Key Components

- Simple timestamp conversion utility
- Basic auto-save wrapper function
- Common retry logic helper
- Shared error handling patterns

## Acceptance Criteria

- [ ] Utilities are simple and focused on single responsibilities
- [ ] No complex abstractions or comprehensive libraries
- [ ] Only extract obvious duplications between roles and personalities
- [ ] Each utility is under 50 lines of code
- [ ] Utilities are pure functions where possible
- [ ] Clear function names that describe exactly what they do

## Technical Requirements

- Create in `packages/ui-shared/src/utils/persistence/`
- Keep utilities small and focused
- Use TypeScript generics only where it simplifies usage
- No external dependencies beyond what's already in the project
- Export utilities through package barrel exports

## Implementation Guidance

**IMPORTANT**: Resist the urge to over-abstract. Keep it extremely simple.

Utilities to create:

1. **mapTimestamps** - Simple helper for timestamp conversion

   ```typescript
   function mapTimestamps(isoString: string | null): Date | null;
   function mapTimestampsToISO(date: Date | null): string | null;
   ```

2. **withAutoSave** - Minimal wrapper for auto-save behavior

   ```typescript
   function withAutoSave(
     saveFunction: () => Promise<void>,
     delayMs: number = 1000,
   ): { triggerSave: () => void; cancelSave: () => void };
   ```

3. **retryWithBackoff** - Simple retry helper
   ```typescript
   function retryWithBackoff<T>(
     fn: () => Promise<T>,
     maxRetries: number = 3,
   ): Promise<T>;
   ```

Do NOT create:

- Generic persistence store factory
- Complex state management abstractions
- Comprehensive adapter wrappers
- Framework-like solutions

These utilities should be so simple that they're obviously correct.

## Testing Requirements

- Unit tests for each utility function
- Test edge cases (null values, failures)
- No integration or performance tests
- Keep test files simple and focused

## Dependencies

- F-state-store-with-auto-save (to identify duplication patterns)
