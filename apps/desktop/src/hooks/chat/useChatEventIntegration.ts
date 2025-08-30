import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@fishbowl-ai/ui-shared";
import type { AgentError } from "@fishbowl-ai/ui-shared";
import type { AgentUpdateEvent } from "../../shared/ipc/chat";
import { useMessagesRefresh } from "../messages";

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

  const { refetch } = useMessagesRefresh();

  // Event handler for IPC events
  const handleAgentUpdate = useCallback(
    (event: AgentUpdateEvent) => {
      try {
        const {
          conversationAgentId,
          status,
          messageId: _messageId,
          error,
          agentName,
          errorType,
          retryable,
        } = event;

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
            if (refetch) {
              refetch().catch((error) => {
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
            if (refetch) {
              refetch().catch((refreshError) => {
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
    [setAgentThinking, setAgentError, refetch],
  );

  // Set up IPC event subscription
  useEffect(() => {
    // Check if running in Electron environment
    if (
      typeof window === "undefined" ||
      !window.electronAPI?.chat?.onAgentUpdate ||
      typeof window.electronAPI.chat.onAgentUpdate !== "function"
    ) {
      setIsConnected(false);
      return;
    }

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
      // Set up IPC event listener
      const unsubscribe =
        window.electronAPI.chat.onAgentUpdate(handleAgentUpdate);

      // Store cleanup function for component unmount
      cleanupRef.current = unsubscribe;
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to set up IPC event listener:", error);
      setIsConnected(false);
    }

    // Cleanup function called when conversationId changes or component unmounts
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
          cleanupRef.current = null;
        } catch (error) {
          console.error("Error during IPC cleanup:", error);
        }
      }
      setIsConnected(false);
    };
  }, [
    conversationId,
    handleAgentUpdate,
    clearConversationState,
    setProcessingConversation,
  ]);

  return {
    isConnected,
    lastEventTime,
  };
}
