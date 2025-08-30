/**
 * Context and hook for sharing message refetch functionality across components
 *
 * @module hooks/messages/useMessagesRefresh
 */

import React, { useContext } from "react";

/**
 * Context for sharing message refetch functionality across components
 */
export const MessagesRefreshContext = React.createContext<{
  refetch: (() => Promise<void>) | null;
}>({
  refetch: null,
});

/**
 * Hook to access message refresh functionality from any component
 */
export function useMessagesRefresh() {
  const context = useContext(MessagesRefreshContext);
  if (!context) {
    throw new Error(
      "useMessagesRefresh must be used within a MessagesRefreshContext.Provider",
    );
  }
  return context;
}
