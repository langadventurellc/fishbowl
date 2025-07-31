---
kind: task
id: T-implement-json-serialization-and
parent: F-error-handling-and-utilities
status: done
title: Implement JSON serialization and deep merge utilities
priority: normal
prerequisites: []
created: "2025-07-31T16:19:51.146458"
updated: "2025-07-31T16:53:51.659042"
schema_version: "1.1"
worktree: null
---

# Implement JSON Serialization and Deep Merge Utilities

## Context

Create robust JSON utilities for safe parsing, serialization, and deep merging of settings objects, handling edge cases that standard JSON operations don't cover.

## Implementation Details

### Files to Create

- `packages/shared/src/services/storage/utils/jsonUtils.ts`
- `packages/shared/src/services/storage/utils/__tests__/jsonUtils.test.ts`

### Technical Approach

Based on patterns from `just` utility library, implement these functions:

**safeJsonParse<T>(jsonString: string, fallback?: T): T | undefined**

- Safe JSON parsing with error handling
- Return fallback value or undefined on parse failure
- Never throw errors - always return result or fallback

**safeJsonStringify(obj: unknown, space?: number): string | undefined**

- Safe JSON serialization handling edge cases
- Handle circular references gracefully
- Filter out functions and undefined values
- Return undefined if serialization fails

**deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T**

- Deep merge multiple objects into target
- Handle nested objects recursively
- Preserve type safety with TypeScript generics
- Don't mutate source objects
- Handle null/undefined values correctly

**isJsonSerializable(value: unknown): boolean**

- Check if value can be safely JSON serialized
- Detect circular references
- Identify non-serializable types (functions, symbols, etc.)

## Acceptance Criteria

### Safe Parsing ✅ Must Implement

- ✅ Never throws errors on malformed JSON
- ✅ Returns fallback values or undefined for invalid input
- ✅ Handles empty strings, null, and undefined input
- ✅ Preserves type information with TypeScript generics
- ✅ Provides clear success/failure indication

### Safe Serialization ✅ Must Implement

- ✅ Handles circular references without throwing
- ✅ Filters out non-serializable values (functions, symbols)
- ✅ Supports optional formatting with space parameter
- ✅ Returns undefined on serialization failure
- ✅ Maintains object structure for valid serializable parts

### Deep Merge ✅ Must Implement

- ✅ Recursively merges nested objects
- ✅ Handles arrays appropriately (replace vs merge)
- ✅ Preserves type safety and doesn't break TypeScript inference
- ✅ Doesn't mutate source objects (immutable operation)
- ✅ Handles null/undefined values without errors
- ✅ Supports merging multiple sources left-to-right

### Edge Case Handling ✅ Must Implement

- ✅ Circular reference detection and handling
- ✅ Very large objects (performance considerations)
- ✅ Mixed data types in merge operations
- ✅ Special JavaScript values (Date, RegExp, etc.)

## Testing Requirements

### Unit Tests Must Cover

**Safe Parsing Tests:**

- Valid JSON strings with various data types
- Malformed JSON strings (missing quotes, brackets, etc.)
- Empty strings, null, and undefined inputs
- Very large JSON strings
- JSON with special characters and Unicode

**Safe Serialization Tests:**

- Objects with circular references
- Objects containing functions and symbols
- Nested objects with mixed data types
- Arrays and primitive values
- Date objects and other special types
- Very large objects

**Deep Merge Tests:**

- Simple object merging
- Nested object merging (multiple levels deep)
- Array handling in merge operations
- Null and undefined value handling
- Multiple source object merging
- Type preservation in TypeScript
- No mutation of source objects

**Serialization Detection Tests:**

- Primitive values (string, number, boolean)
- Objects with circular references
- Functions and symbols
- Arrays with mixed content
- Special objects (Date, RegExp, etc.)

## Dependencies

- TypeScript for type safety and generics
- Integration with existing error handling patterns
- Consider patterns from `just` utility library for implementation guidance

## File Locations

- Add to existing `utils/` directory: `packages/shared/src/services/storage/utils/`
- Follow existing test patterns and file structure
- Export from utils/index.ts barrel file

### Log

**2025-07-31T22:05:37.029960Z** - Implemented comprehensive JSON serialization and deep merge utilities for the Fishbowl settings persistence system. Created four robust utility functions (safeJsonParse, safeJsonStringify, deepMerge, isJsonSerializable) with complete TypeScript type safety, circular reference handling, and comprehensive error handling. All functions follow the one-export-per-file rule and include extensive test coverage (20+ test cases per function) covering edge cases, error scenarios, and real-world usage patterns. The utilities integrate seamlessly with the existing error handling infrastructure and provide safe JSON operations for the broader persistence system.

- filesChanged: ["packages/shared/src/services/storage/utils/safeJsonParse.ts", "packages/shared/src/services/storage/utils/safeJsonStringify.ts", "packages/shared/src/services/storage/utils/deepMerge.ts", "packages/shared/src/services/storage/utils/isJsonSerializable.ts", "packages/shared/src/services/storage/utils/__tests__/safeJsonParse.test.ts", "packages/shared/src/services/storage/utils/__tests__/safeJsonStringify.test.ts", "packages/shared/src/services/storage/utils/__tests__/deepMerge.test.ts", "packages/shared/src/services/storage/utils/__tests__/isJsonSerializable.test.ts", "packages/shared/src/services/storage/utils/index.ts"]
