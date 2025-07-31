/**
 * Custom hook for agent search functionality with debouncing, filtering, and accessibility.
 * Provides comprehensive search state management for agent lists across platforms.
 *
 * Features:
 * - Debounced search with configurable delay (default 300ms)
 * - Case-insensitive filtering across name, model, and role fields
 * - Loading state management during debounce period
 * - Screen reader announcements for search results
 * - Keyboard navigation support (Escape to clear)
 * - Results count and clear functionality
 *
 * @module hooks/useAgentSearch
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AgentCard } from "../types/settings/AgentCard";

interface UseAgentSearchOptions {
  agents: AgentCard[];
  debounceDelay?: number;
  announceToScreenReader?: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void;
}

interface UseAgentSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  filteredAgents: AgentCard[];
  isSearching: boolean;
  resultsCount: number;
  clearSearch: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Hook for managing agent search functionality with debouncing and accessibility.
 *
 * @param options - Configuration options for the search hook
 * @param options.agents - Array of agents to search through
 * @param options.debounceDelay - Debounce delay in milliseconds (default: 300)
 * @param options.announceToScreenReader - Optional function for screen reader announcements
 * @returns Search state and handlers for managing agent search
 */
export function useAgentSearch({
  agents,
  debounceDelay = 300,
  announceToScreenReader,
}: UseAgentSearchOptions): UseAgentSearchReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term with loading state management
  useEffect(() => {
    setIsSearching(true);

    const timer = globalThis.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, debounceDelay);

    return () => globalThis.clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Reset loading state on initial render when search term is empty
  useEffect(() => {
    if (searchTerm === "" && debouncedSearchTerm === "") {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Filter agents based on debounced search term
  const filteredAgents = useMemo(() => {
    if (!agents || !Array.isArray(agents)) {
      return [];
    }

    if (!debouncedSearchTerm.trim()) {
      return agents;
    }

    const query = debouncedSearchTerm.toLowerCase();
    return agents.filter(
      (agent) =>
        agent?.name?.toLowerCase().includes(query) ||
        agent?.model?.toLowerCase().includes(query) ||
        agent?.role?.toLowerCase().includes(query),
    );
  }, [agents, debouncedSearchTerm]);

  // Announce search results to screen readers after filtering completes
  useEffect(() => {
    if (debouncedSearchTerm && !isSearching && announceToScreenReader) {
      const count = filteredAgents.length;
      const message =
        count === 0
          ? `No agents found for "${debouncedSearchTerm}"`
          : `Found ${count} agent${count === 1 ? "" : "s"} for "${debouncedSearchTerm}"`;

      announceToScreenReader(message, "polite");
    }
  }, [
    filteredAgents.length,
    debouncedSearchTerm,
    isSearching,
    announceToScreenReader,
  ]);

  /**
   * Clear the search term and announce to screen readers.
   */
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    if (announceToScreenReader) {
      announceToScreenReader("Search cleared", "polite");
    }
  }, [announceToScreenReader]);

  /**
   * Handle keyboard events for search input.
   * - Escape key: Clear search
   * - Enter key: Handled naturally by form submission
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        clearSearch();
      }
      // Enter key is handled by form submission naturally
    },
    [clearSearch],
  );

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredAgents,
    isSearching,
    resultsCount: filteredAgents.length,
    clearSearch,
    handleKeyDown,
  };
}
