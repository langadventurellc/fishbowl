/**
 * Chat service interfaces for platform abstraction and dependency injection.
 *
 * This module exports all interfaces needed for chat orchestration and
 * multi-agent coordination, following the established bridge pattern for
 * platform-specific implementations.
 *
 * @example
 * ```typescript
 * import {
 *   LlmBridgeInterface
 * } from '@fishbowl-ai/shared/services/chat/interfaces';
 * ```
 */

// ============================================================================
// LLM Provider Bridge Interface
// ============================================================================

/**
 * Platform-agnostic LLM provider interface for chat orchestration.
 * Abstracts provider-specific operations for dependency injection.
 */
export type { LlmBridgeInterface } from "./LlmBridgeInterface";
