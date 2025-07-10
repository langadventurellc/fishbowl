# Integration Tests

This directory contains comprehensive integration tests for the IPC communication bridge system. These tests verify the complete communication flow between Electron's main process, preload script, and renderer process.

## Test Structure

### Database Integration (`ipc-database-integration.test.ts`)

Tests the complete database operation flow through IPC:

- Agent CRUD operations
- Conversation management
- Message handling
- Transaction operations
- Error handling and validation
- Performance monitoring

### Secure Storage Integration (`ipc-secure-storage-integration.test.ts`)

Tests secure storage operations through IPC:

- Keytar operations (get, set, delete)
- AI provider credential management
- Security validation
- Error handling for keychain access
- Concurrent operations

### Preload Integration (`ipc-preload-integration.test.ts`)

Tests the preload script functionality:

- API exposure to renderer process
- Input validation and sanitization
- Performance monitoring
- Security auditing
- Rate limiting
- Cross-process communication

### End-to-End Integration (`ipc-end-to-end-integration.test.ts`)

Tests complete workflows using React hooks:

- Agent management workflows
- Conversation creation with agents
- Message creation and batch operations
- Secure storage credential management
- Complex multi-step workflows
- Error recovery across operations

## Running Integration Tests

```bash
# Run all integration tests
npm run test tests/integration

# Run specific integration test
npm run test tests/integration/ipc-database-integration.test.ts

# Run integration tests with coverage
npm run test:coverage tests/integration
```

## Test Patterns

### Mocking Strategy

- Mock Electron IPC interfaces (`ipcMain`, `ipcRenderer`, `contextBridge`)
- Mock external dependencies (`keytar`, `better-sqlite3`)
- Mock performance and security monitoring interfaces

### Validation Testing

- Input sanitization (XSS prevention)
- UUID format validation
- Required field validation
- Type safety verification

### Error Handling Testing

- Network failures
- Database constraint violations
- Security validation failures
- Malformed responses
- Timeout scenarios

### Performance Testing

- Concurrent operation handling
- Performance metric tracking
- Slow operation detection
- Rate limiting verification

### Security Testing

- Malicious input detection
- Privilege escalation prevention
- Audit logging verification
- Sensitive data protection

## Coverage Goals

Integration tests should achieve:

- 90%+ coverage of IPC handler functions
- 100% coverage of critical security validation paths
- 95%+ coverage of database operation flows
- 90%+ coverage of error handling scenarios

## Maintenance

When adding new IPC channels or handlers:

1. Add corresponding integration tests
2. Update test mocks to include new operations
3. Verify error handling scenarios
4. Test performance and security implications
5. Update this documentation
