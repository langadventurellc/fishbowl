import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@fishbowl-ai/ui-shared";
import type { AgentError } from "@fishbowl-ai/ui-shared";
import { useConversationStore } from "@fishbowl-ai/ui-shared";

// Type for agent update events (matches store's internal type)
type AgentUpdateEvent = {
  conversationId: string;
  conversationAgentId: string;
  status: "thinking" | "complete" | "error";
  messageId?: string;
  error?: string;
  agentName?: string;
  errorType?:
    | "network"
    | "auth"
    | "rate_limit"
    | "validation"
    | "provider"
    | "timeout"
    | "unknown";
  retryable?: boolean;
};

interface UseChatEventIntegrationOptions {
  conversationId: string | null;
}

interface UseChatEventIntegrationResult {
  isConnected: boolean;
  lastEventTime: string | null;
}

/**
 * React hook that integrates the shared useChatStore with IPC chat events.
 * Subscribes to agent update events from the main process and syncs them with the store state.
 */
export function useChatEventIntegration(
  options: UseChatEventIntegrationOptions,
): UseChatEventIntegrationResult {
  const { conversationId } = options;
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);

  const {
    setAgentThinking,
    setAgentError,
    setProcessingConversation,
    clearConversationState,
  } = useChatStore();

  const { refreshActiveConversation, subscribeToAgentUpdates } =
    useConversationStore();

  // Event handler for IPC events
  const handleAgentUpdate = useCallback(
    (event: AgentUpdateEvent) => {
      try {
        const {
          conversationId: eventConversationId,
          conversationAgentId,
          status,
          messageId: _messageId,
          error,
          agentName,
          errorType,
          retryable,
        } = event;

        // Filter events that don't match current conversation
        if (eventConversationId !== conversationId) {
          // Optional: Log filtered events in development
          if (process.env.NODE_ENV === "development") {
            console.debug(
              `Filtered AgentUpdateEvent for conversation ${eventConversationId}, expected ${conversationId}`,
            );
          }
          return;
        }

        // Update last event time
        setLastEventTime(new Date().toISOString());

        // Map event status to store actions
        switch (status) {
          case "thinking":
            setAgentThinking(conversationAgentId, true);
            break;

          case "complete":
            setAgentThinking(conversationAgentId, false);
            setAgentError(conversationAgentId, null);

            // Refresh messages to show the new agent response
            if (refreshActiveConversation) {
              refreshActiveConversation().catch((error) => {
                console.error(
                  "Failed to refresh messages after agent completion:",
                  error,
                );
              });
            }
            break;

          case "error": {
            setAgentThinking(conversationAgentId, false);

            // Create structured error object with rich context
            const structuredError: AgentError = {
              message: error || "An unknown error occurred",
              agentName,
              errorType,
              retryable: retryable || false,
            };

            setAgentError(conversationAgentId, structuredError);

            // Refresh messages to show any error system messages that were created
            if (refreshActiveConversation) {
              refreshActiveConversation().catch((refreshError) => {
                console.error(
                  "Failed to refresh messages after agent error:",
                  refreshError,
                );
              });
            }
            break;
          }

          default:
            console.warn(`Unknown agent status: ${status}`);
        }
      } catch (eventError) {
        console.error("Error processing agent update event:", eventError);
      }
    },
    [
      conversationId,
      setAgentThinking,
      setAgentError,
      refreshActiveConversation,
    ],
  );

  // Set up event subscription via store
  useEffect(() => {
    // Clear previous conversation state if conversationId is changing
    if (conversationId) {
      clearConversationState();
      setProcessingConversation(conversationId);
    } else {
      clearConversationState();
      setIsConnected(false);
      return;
    }

    try {
      // Subscribe through the store
      const unsubscribe = subscribeToAgentUpdates(handleAgentUpdate);

      if (unsubscribe) {
        // Store cleanup function for component unmount
        cleanupRef.current = unsubscribe;
        setIsConnected(true);
      } else {
        // Not available on this platform (e.g., non-Electron)
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Failed to set up event subscription:", error);
      setIsConnected(false);
    }

    // Cleanup function called when conversationId changes or component unmounts
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
          cleanupRef.current = null;
        } catch (error) {
          console.error("Error during subscription cleanup:", error);
        }
      }
      setIsConnected(false);
    };
  }, [
    conversationId,
    handleAgentUpdate,
    clearConversationState,
    setProcessingConversation,
    subscribeToAgentUpdates,
  ]);

  return {
    isConnected,
    lastEventTime,
  };
}
