import type { LlmConfigData } from "./LlmConfigData";

/**
 * Props interface for LlmProviderCard component
 */
export interface LlmProviderCardProps {
  api: LlmConfigData & {
    id: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}
