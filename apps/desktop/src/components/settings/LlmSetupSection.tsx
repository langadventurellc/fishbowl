/**
 * LLM Setup Settings component for managing LLM provider configurations.
 *
 * @note This is a temporary wrapper during migration from API Keys to LLM Setup.
 * The ApiKeysSettings component will be replaced with new LLM-specific components.
 *
 * @module components/settings/LlmSetupSection
 */
import React from "react";
import { ApiKeysSettings } from "./ApiKeysSettings";

/**
 * LLM Setup section component that manages LLM configurations.
 *
 * Currently wraps the ApiKeysSettings component to maintain existing functionality
 * while establishing the new component structure for future enhancements.
 *
 * @param _className - Optional CSS class name (unused in current implementation)
 * @returns LLM Setup section component
 */
export function LlmSetupSection({
  className: _className,
}: {
  className?: string;
}) {
  return <ApiKeysSettings />;
}
