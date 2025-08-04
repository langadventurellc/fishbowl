/**
 * LlmProviderCard component displays a configured LLM provider API.
 *
 * Features:
 * - Full-width card layout
 * - Displays custom name and provider type
 * - Edit and delete action buttons
 * - Follows existing ProviderCard design patterns
 *
 * @module components/settings/llm-setup/LlmProviderCard
 */

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

export interface LlmProviderCardProps {
  api: {
    id: string;
    customName: string;
    provider: "openai" | "anthropic";
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export const LlmProviderCard: React.FC<LlmProviderCardProps> = ({
  api,
  onEdit,
  onDelete,
  className,
}) => {
  const providerName = api.provider === "openai" ? "OpenAI" : "Anthropic";

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{api.customName}</h3>
          <p className="text-sm text-muted-foreground">{providerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
            aria-label={`Edit ${api.customName} configuration`}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-destructive hover:text-destructive"
            aria-label={`Delete ${api.customName} configuration`}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
