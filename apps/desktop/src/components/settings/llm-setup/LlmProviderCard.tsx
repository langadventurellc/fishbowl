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

import type { LlmProviderCardProps } from "@fishbowl-ai/ui-shared";
import { Edit2, Trash2 } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

export const LlmProviderCard: React.FC<LlmProviderCardProps> = ({
  api,
  onEdit,
  onDelete,
  className,
}) => {
  const providerName = api.provider === "openai" ? "OpenAI" : "Anthropic";

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{api.customName}</h3>
          <p className="text-sm text-muted-foreground">{providerName}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${api.customName} configuration`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="hover:bg-destructive/10"
            aria-label={`Delete ${api.customName} configuration`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
