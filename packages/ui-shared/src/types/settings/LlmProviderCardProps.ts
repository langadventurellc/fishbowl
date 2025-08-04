import type { LlmConfigData } from "./LlmConfigData";

/**
 * Props interface for LlmProviderCard component
 */
export interface LlmProviderCardProps {
  api: LlmConfigData & {
    id: string;
    provider: "openai" | "anthropic";
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}
