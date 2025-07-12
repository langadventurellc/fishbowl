# Test Performance Analysis and Optimization Plan

## Overview

This document categorizes the current test suite by performance characteristics and provides recommendations for optimizing test execution time while maintaining test quality and coverage.

## Current Test Suite Statistics

- **Total Test Files**: 75 test files
- **Test Framework**: Vitest with happy-dom environment
- **Test Categories**: Unit tests (57 files), Integration tests (18 files)
- **Current Issue**: Tests are taking too long and will get worse as the app grows

## Performance Categories

### 1. Fast Unit Tests (< 10ms per test)

_Should remain in the main test suite for fast feedback_

#### Type Validation Tests

- `tests/unit/shared/types/validation-schemas.test.ts`
  - Pure Zod schema validation
  - No external dependencies
  - Simple object validation and error checking

#### Pure Function Tests

- `tests/unit/shared/utils/ai/getActiveMessagesForAI.test.ts`
  - Array filtering and sorting operations
  - No database or network dependencies
  - Simple data transformation logic

#### Service Layer Tests

- `tests/unit/renderer/services/ai/AgentService.test.ts`
  - Business logic with mocked dependencies
  - Pure function behavior testing

#### Store/State Management Tests

- `tests/unit/renderer/store/slices/agents.test.ts`
  - Zustand store state management
  - In-memory state operations

#### Error Handling Tests

- `tests/unit/shared/types/error-classes.test.ts`
  - Error class constructors and properties
  - Simple object instantiation tests

### 2. Slow Tests (100ms+ per test)

_Should be moved to separate test suite for CI/integration testing_

#### Database Integration Tests

- `tests/integration/ipc-database-integration.test.ts`
  - Full IPC communication testing
  - Database operations with setup/teardown
  - Complex Electron IPC handler mocking

- `tests/integration/ipc-database-performance-integration.test.ts`
  - Performance monitoring and benchmarking
  - Database query metrics collection
  - Complex performance analysis scenarios

- `tests/unit/main/database/queries/messages/getActiveMessagesByConversationId.test.ts`
  - Database query testing with SQLite mocking
  - Complex query validation and result verification

#### Performance Monitoring Tests

- `tests/unit/main/performance/IpcPerformanceMonitor.test.ts`
  - Performance measurement with real timing
  - Slow operation simulation with `setTimeout`
  - Memory usage tracking and monitoring

- `tests/unit/renderer/store/performance/store-operation-performance.test.ts`
  - Store operation performance benchmarking
  - High-frequency operation testing (100+ operations)
  - Memory usage monitoring and thresholds

#### IPC Communication Tests

- `tests/integration/ipc-communication-integration.test.ts`
  - Cross-process communication simulation
  - Complex IPC handler setup and teardown
  - Multiple async operations in sequence

#### Transaction Tests

- `tests/unit/main/database/transactions/TransactionManager.test.ts`
  - Database transaction simulation
  - Rollback and commit testing
  - Complex error handling scenarios

### 3. Potentially Optimizable Tests

_Tests that could be faster with optimization_

#### Complex React Component Tests

- `tests/unit/renderer/hooks/useMessages.test.ts`
  - **Current Performance**: 33.43 seconds total (33 tests, ~1 second per test)
  - **Individual Test Times**: 3-3.008 seconds per test (extremely slow)
  - **Issues**: Extensive mocking setup in beforeEach, multiple similar test cases, artificial delays
  - **Solutions**: Use test fixtures, reduce mock complexity, parametrize tests, use fake timers
  - **Priority**: HIGH - This is the slowest test file in the suite

#### Database Connection Tests

- `tests/unit/main/database/connection/initializeDatabase.test.ts`
  - **Current Performance**: 230ms total (6 tests, ~38ms per test)
  - **Individual Test Times**: 3ms actual test time (setup overhead is the issue)
  - **Issues**: Database initialization simulation, file system operations, test environment setup
  - **Solutions**: Mock at higher level, use in-memory alternatives, reduce setup complexity
  - **Priority**: MEDIUM - Fast tests but with high setup overhead

#### Performance Tests with Artificial Delays

- `tests/unit/main/performance/IpcPerformanceMonitor.test.ts`
  - **Current Performance**: 617ms total (15 tests, ~41ms per test)
  - **Individual Test Times**: 385ms actual test time (real setTimeout delays)
  - **Issues**: Real setTimeout delays (25ms, 60ms), multiple performance measurements
  - **Solutions**: Use fake timers, reduce delays, reduce iteration counts
  - **Priority**: HIGH - Contains real timing delays that slow down tests

#### Integration Tests with Complex Setup

- `tests/integration/ai-context-filtering-integration.test.ts`
  - **Current Performance**: 243ms total (9 tests, ~27ms per test)
  - **Individual Test Times**: 7ms actual test time (setup overhead is the issue)
  - **Issues**: Complex test data setup, multiple service instantiations, integration environment setup
  - **Solutions**: Use test fixtures, reuse service instances, optimize test environment
  - **Priority**: MEDIUM - Good test time but high setup overhead

## Recommended Test Suite Structure

### Fast Test Suite (npm run test:fast)

_For development and quick feedback_

```bash
# Run only fast unit tests
npm run test:fast
```

**Include:**

- Type validation tests
- Pure function tests
- Service layer tests with mocked dependencies
- Store/state management tests
- Error handling tests
- Simple utility function tests

**Exclude:**

- Database integration tests
- IPC communication tests
- Performance monitoring tests
- Complex React component integration tests
- File system operations
- Tests with real timers/delays

### Integration Test Suite (npm run test:integration)

_For CI/CD and comprehensive testing_

```bash
# Run all integration and performance tests
npm run test:integration
```

**Include:**

- Database integration tests
- IPC communication tests
- Performance monitoring tests
- Complex React component integration tests
- Transaction tests
- End-to-end workflows

### Performance Test Suite (npm run test:performance)

_For performance regression testing_

```bash
# Run only performance benchmarks
npm run test:performance
```

**Include:**

- Database performance tests
- Store operation performance tests
- IPC performance monitoring tests
- Memory usage tests
- Slow operation simulation tests

## Implementation Plan

### Phase 1: Quick Wins (Immediate)

1. **Use fake timers** in performance tests
   - Replace real setTimeout with vi.useFakeTimers()
   - Reduce artificial delays in tests

2. **Optimize React hook tests**
   - Reduce mock complexity in useMessages.test.ts
   - Use test fixtures instead of complex setup

3. **Parametrize similar tests**
   - Convert repeated test cases to test.each()
   - Reduce test duplication

### Phase 2: Test Suite Separation (Short-term)

1. **Create test configuration files**
   - `vitest.config.fast.ts` - Fast unit tests only
   - `vitest.config.integration.ts` - Integration tests
   - `vitest.config.performance.ts` - Performance tests

2. **Update package.json scripts**

   ```json
   {
     "test:fast": "vitest --config vitest.config.fast.ts",
     "test:integration": "vitest --config vitest.config.integration.ts",
     "test:performance": "vitest --config vitest.config.performance.ts",
     "test:all": "npm run test:fast && npm run test:integration"
   }
   ```

3. **Update CI/CD pipeline**
   - Run fast tests on every commit
   - Run integration tests on PR
   - Run performance tests on merge to main

### Phase 3: Advanced Optimizations (Medium-term)

1. **Implement test data builders**
   - Create factory functions for complex test data
   - Reduce setup complexity in integration tests

2. **Mock optimization**
   - Mock database operations at higher abstraction levels
   - Use in-memory alternatives for file system operations

3. **Parallel test execution**
   - Configure Vitest for parallel execution where safe
   - Optimize test isolation for parallelization

## Expected Performance Improvements

### Current State

- All tests run together
- Slow tests block fast feedback
- Development workflow impacted by test duration

### After Optimization

- **Fast tests**: < 5 seconds for development feedback
- **Integration tests**: Run separately, 30-60 seconds
- **Performance tests**: Run on demand, 2-5 minutes

## Test File Classifications

### Fast Unit Tests (Keep in main suite)

- `tests/unit/shared/types/validation-schemas.test.ts`
- `tests/unit/shared/utils/ai/getActiveMessagesForAI.test.ts`
- `tests/unit/renderer/services/ai/AgentService.test.ts`
- `tests/unit/renderer/store/slices/agents.test.ts`
- `tests/unit/shared/types/error-classes.test.ts`

### Slow Tests (Move to separate suite)

- `tests/integration/ipc-database-integration.test.ts`
- `tests/integration/ipc-database-performance-integration.test.ts`
- `tests/unit/main/database/queries/messages/getActiveMessagesByConversationId.test.ts`
- `tests/unit/main/performance/IpcPerformanceMonitor.test.ts`
- `tests/unit/renderer/store/performance/store-operation-performance.test.ts`
- `tests/integration/ipc-communication-integration.test.ts`
- `tests/unit/main/database/transactions/TransactionManager.test.ts`

### Optimizable Tests (Fix performance issues)

- `tests/unit/renderer/hooks/useMessages.test.ts`
- `tests/unit/main/database/connection/initializeDatabase.test.ts`
- `tests/integration/ai-context-filtering-integration.test.ts`

## Success Metrics

- **Development test runs**: < 5 seconds
- **CI/CD feedback**: < 30 seconds for fast tests
- **Full test suite**: Complete in under 5 minutes
- **Developer productivity**: Fast feedback loop maintained as codebase grows

## Next Steps

1. Implement Phase 1 optimizations
2. Create separate test configurations
3. Update development workflow documentation
4. Monitor and measure performance improvements
5. Iterate based on feedback and growth patterns
