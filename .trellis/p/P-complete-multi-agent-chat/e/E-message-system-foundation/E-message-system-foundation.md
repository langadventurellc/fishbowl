---
id: E-message-system-foundation
title: Message System Foundation
status: in-progress
priority: medium
parent: P-complete-multi-agent-chat
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/messagesConstants.ts:
    Created IPC channel constants
    for messages operations with MESSAGES_CHANNELS object and
    MessagesChannelType union type
  apps/desktop/src/shared/ipc/messages/listRequest.ts:
    Created MessagesListRequest
    interface for retrieving messages by conversationId
  apps/desktop/src/shared/ipc/messages/listResponse.ts: Created MessagesListResponse interface extending IPCResponse<Message[]>
  apps/desktop/src/shared/ipc/messages/createRequest.ts: Created MessagesCreateRequest interface accepting CreateMessageInput
  apps/desktop/src/shared/ipc/messages/createResponse.ts: Created MessagesCreateResponse interface extending IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/updateInclusionRequest.ts:
    Created MessagesUpdateInclusionRequest interface for updating message
    inclusion flags
  apps/desktop/src/shared/ipc/messages/updateInclusionResponse.ts:
    Created MessagesUpdateInclusionResponse interface extending
    IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/index.ts: Created barrel file exporting all messages request/response types
  apps/desktop/src/shared/ipc/index.ts: Added messages constants, request types,
    and response types exports to main IPC index
  apps/desktop/src/main/services/MainProcessServices.ts: Added MessageRepository import and initialization with proper error handling
  apps/desktop/src/electron/messagesHandlers.ts: Created new file with
    setupMessagesHandlers function implementing messages:list, messages:create,
    and messages:updateInclusion handlers
  apps/desktop/src/electron/main.ts: Added import for setupMessagesHandlers and
    created setupMessagesIpcHandlers function following established patterns
  apps/desktop/src/electron/preload.ts:
    Extended electronAPI object with messages
    API implementing list, create, and updateInclusion operations following
    established patterns from conversations API
  apps/desktop/src/types/electron.d.ts:
    Added MessagesAPI interface to ElectronAPI
    type definition with proper JSDoc documentation for all three operations
  apps/desktop/src/electron/__tests__/preload.messages.test.ts:
    Created comprehensive unit tests for messages preload API with 24 test cases
    covering success scenarios, error handling, IPC communication failures, and
    contextBridge integration
  apps/desktop/src/hooks/messages/useMessages.ts: Created new useMessages hook
    following useConversations pattern with conversationId parameter, message
    fetching via IPC, proper error handling, and stable chronological sorting
  apps/desktop/src/hooks/messages/index.ts: Created barrel export file for
    messages hooks with proper JSDoc documentation; Updated barrel export file
    to include useCreateMessage hook with documentation examples; Updated barrel
    export file to include useUpdateMessage hook with documentation examples
  apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx:
    Created comprehensive unit test suite with 18 test scenarios covering all
    hook functionality including success cases, error handling, environment
    detection, refetch operations, sorting behavior, and memory cleanup
  apps/desktop/src/hooks/messages/useCreateMessage.ts: Created new
    useCreateMessage hook with validation, error handling, and IPC integration
    following useCreateConversation pattern
  apps/desktop/src/hooks/messages/__tests__/useCreateMessage.test.tsx:
    Created comprehensive unit test suite with 23 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and memory cleanup
  apps/desktop/src/hooks/messages/useUpdateMessage.ts: Created new
    useUpdateMessage hook with updateInclusion function, proper error handling,
    environment detection, and state management following established patterns
  apps/desktop/src/hooks/messages/__tests__/useUpdateMessage.test.tsx:
    Created comprehensive unit test suite with 22 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and concurrent operations
  packages/shared/src/repositories/messages/MessageRepository.ts:
    Updated SQL query in getByConversation() method to include stable ordering
    (ORDER BY created_at ASC, id ASC) and improved query comment for clarity
  packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts:
    Updated existing ordering test to expect new query format and added
    comprehensive test case for stable ordering with identical timestamps to
    ensure consistent message display
log: []
schema: v1.0
childrenIds:
  - F-message-hooks-implementation
  - F-message-repository-integration
  - F-messages-ipc-bridge
created: 2025-08-29T16:34:02.591Z
updated: 2025-08-29T16:34:02.591Z
---

# Message System Foundation

## Purpose and Goals

Establish the foundational message management system that handles persistence, retrieval, and basic operations. This epic creates the data layer and hooks needed for chat functionality.

## Major Components and Deliverables

### Message Hooks Layer (`apps/desktop/src/hooks/messages/`)

- **useMessages**: Fetch and display messages for a conversation with real-time updates
- **useCreateMessage**: Send new messages (user or system) with proper error handling
- **useUpdateMessage**: Update message properties (inclusion flags, content)

### IPC Bridge for Messages (`apps/desktop/src/main/handlers/messages/`)

- **Main process handlers**: `messages.list`, `messages.create`, `messages.updateInclusion`
- **Preload exposure**: Safe renderer access via `window.electronAPI.messages`
- **Type safety**: Full TypeScript contracts between renderer and main

### Message Repository Integration

- **Direct database access**: All persistence through existing MessageRepository in main process
- **Security boundary**: No direct DB access from renderer - only through IPC
- **Immediate persistence**: No caching or batching - save messages instantly

## Detailed Acceptance Criteria

### useMessages Hook

- **GIVEN** a conversation ID
- **WHEN** the hook is called
- **THEN** it should:
  - Fetch all messages for that conversation via IPC
  - Return messages sorted by `created_at ASC, id ASC` for stable ordering (prefer repository SQL; otherwise sort in hook)
  - Provide loading, error, and refetch states
  - Support simple real-time behavior via refetch-after-create/update and listening to `agent:update` events (no generic event bus)
  - Handle empty conversations gracefully

### useCreateMessage Hook

- **GIVEN** message creation requests
- **WHEN** creating user or system messages
- **THEN** it should:
  - Accept `CreateMessageInput` with conversation_id, role, content
  - Save message immediately via main process MessageRepository
  - Return sending state and error handling
  - Trigger useMessages refresh for real-time UI updates
  - Handle validation errors (empty content, invalid conversation)

### useUpdateMessage Hook

- **GIVEN** message modification needs
- **WHEN** updating message properties
- **THEN** it should:
  - Support inclusion flag changes for context control
  - Update message content if needed
  - Persist changes immediately to database
  - Provide optimistic updates with rollback on failure

### Messages IPC Implementation

- **GIVEN** renderer-main communication needs
- **WHEN** message operations are requested
- **THEN** it should:
  - Expose typed `window.electronAPI.messages` interface
  - Handle `list(conversationId)` returning `Promise<Message[]>`
  - Handle `create(input)` returning `Promise<Message>`
  - Handle `updateInclusion(id, included)` returning `Promise<Message>`
  - Enforce security - no raw database access from renderer
  - Provide clear error messages for failures
  - Preload exposure: `window.electronAPI.messages = { list, create, updateInclusion }`

### Database Integration

- **GIVEN** message operations
- **WHEN** persistence is needed
- **THEN** it should:
  - Use existing MessageRepository exclusively in main process
  - Support all CRUD operations through repository interface
  - Maintain referential integrity with conversations and agents
  - Handle concurrent access safely
  - Provide transaction support for complex operations

## Technical Considerations

- **Pattern Consistency**: Follow exact patterns from `useConversations` and `useConversationAgents`
- **Error Handling**: Comprehensive error states and user-friendly messages
- **Type Safety**: Full TypeScript coverage across IPC boundary
- **Security**: Strict renderer/main process separation
- **Performance**: Efficient queries with proper indexing
- **Non-Goals (MVP)**: No streaming responses; no global event bus

## Dependencies on Other Epics

- **None** - This is the foundational epic that others build upon
- Provides the data layer needed by Chat Orchestration and UI Integration

## Estimated Scale

- **3-4 Features** covering hooks, IPC, and repository integration
- **Foundation for** all subsequent chat functionality

## User Stories

- As a developer, I need reliable message hooks so I can build chat UI components
- As a user, I need my messages saved immediately so I don't lose conversations
- As a developer, I need type-safe IPC so I can prevent runtime errors

## Non-functional Requirements

- **Response Time**: Message operations complete within 100ms locally
- **Reliability**: 100% success rate for local database operations
- **Type Safety**: Zero `any` types in message interfaces
- **Security**: Complete isolation of database access to main process

## Testing and Validation Requirements

- **Unit Tests**: All hooks with mock IPC responses
- **Integration Tests**: IPC handlers with real MessageRepository
- **Error Scenarios**: Network failures, validation errors, concurrent access
- **Type Tests**: Interface contracts across process boundary
