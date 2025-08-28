/**
 * AgentCard component displays individual agent information with interactive elements.
 *
 * Features:
 * - Prominent agent name and model display
 * - Role information in secondary text
 * - Edit and delete buttons with hover states
 * - Accessibility attributes and keyboard navigation
 * - Responsive design and proper touch targets
 *
 * @module components/settings/agents/AgentCard
 */

import type { AgentCardProps } from "@fishbowl-ai/ui-shared";
import { getRoleById } from "@fishbowl-ai/ui-shared";
import { Edit, Trash2 } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { FOCUS_STYLES } from "../../../styles/focus";
import { useLlmModels } from "../../../hooks/useLlmModels";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  className,
}) => {
  const { models } = useLlmModels();

  const handleEdit = () => {
    onEdit?.(agent.id);
  };

  const handleDelete = () => {
    onDelete?.(agent.id);
  };

  // Get display names
  const roleDisplayName = getRoleById(agent.role)?.name || agent.role;

  // Find model using both configId and model id for accurate resolution
  const resolvedModel = models.find(
    (m) => m.configId === agent.llmConfigId && m.id === agent.model,
  );

  // Fallback to stored model string if not found
  const modelDisplayName = resolvedModel?.name || agent.model;

  return (
    <Card
      className={cn(
        "hover:shadow-md lg:hover:shadow-lg transition-all duration-[var(--dt-animation-hover-transition)] group",
        "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
        className,
      )}
      role="article"
      aria-labelledby={`agent-name-${agent.id}`}
      aria-describedby={`agent-details-${agent.id}`}
      tabIndex={0}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle id={`agent-name-${agent.id}`} className="text-lg">
              {agent.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{modelDisplayName}</p>
          </div>
          <div
            className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            role="toolbar"
            aria-label={`Actions for ${agent.name}`}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", FOCUS_STYLES.button)}
              onClick={handleEdit}
              aria-label={`Edit ${agent.name} agent`}
              aria-describedby={`agent-details-${agent.id}`}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", FOCUS_STYLES.button)}
              onClick={handleDelete}
              aria-label={`Delete ${agent.name} agent`}
              aria-describedby={`agent-details-${agent.id}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div id={`agent-details-${agent.id}`} className="sr-only">
          Agent {agent.name} using {modelDisplayName} model for{" "}
          {roleDisplayName}. Actions available: Edit and Delete.
        </div>
        <p className="text-sm text-muted-foreground" aria-hidden="true">
          {roleDisplayName}
        </p>
      </CardContent>
    </Card>
  );
};
