/**
 * Personalities hook for UI components.
 *
 * Provides a convenient interface to the personalities store with memoized callbacks
 * and shallow comparison for optimal performance. This hook abstracts the direct
 * store usage and provides a clean API for components.
 *
 * @module hooks/usePersonalities
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePersonalitiesStore } from "../stores/usePersonalitiesStore";

/**
 * Hook for accessing personalities state and actions.
 *
 * @returns Personalities state and actions with memoized callbacks
 */
export const usePersonalities = () => {
  const { personalities, isLoading, error } = usePersonalitiesStore(
    useShallow((state) => ({
      personalities: state.personalities,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const createPersonality = usePersonalitiesStore(
    (state) => state.createPersonality,
  );
  const updatePersonality = usePersonalitiesStore(
    (state) => state.updatePersonality,
  );
  const deletePersonality = usePersonalitiesStore(
    (state) => state.deletePersonality,
  );
  const getPersonalityById = usePersonalitiesStore(
    (state) => state.getPersonalityById,
  );
  const isPersonalityNameUnique = usePersonalitiesStore(
    (state) => state.isPersonalityNameUnique,
  );
  const clearError = usePersonalitiesStore((state) => state.clearError);

  return {
    personalities,
    isLoading,
    error,
    createPersonality: useCallback(createPersonality, [createPersonality]),
    updatePersonality: useCallback(updatePersonality, [updatePersonality]),
    deletePersonality: useCallback(deletePersonality, [deletePersonality]),
    getPersonalityById: useCallback(getPersonalityById, [getPersonalityById]),
    isPersonalityNameUnique: useCallback(isPersonalityNameUnique, [
      isPersonalityNameUnique,
    ]),
    clearError: useCallback(clearError, [clearError]),
  };
};
