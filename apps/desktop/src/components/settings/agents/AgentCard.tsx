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

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { FOCUS_STYLES } from "../../../styles/focus";
import { Edit, Trash2 } from "lucide-react";
import type { AgentCardProps } from "@fishbowl-ai/shared";

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  className,
}) => {
  const handleEdit = () => {
    onEdit?.(agent.id);
  };

  const handleDelete = () => {
    onDelete?.(agent.id);
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md lg:hover:shadow-lg transition-all duration-200 group",
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
            <p className="text-sm text-muted-foreground">{agent.model}</p>
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
          Agent {agent.name} using {agent.model} model for {agent.role}. Actions
          available: Edit and Delete.
        </div>
        <p className="text-sm text-muted-foreground" aria-hidden="true">
          {agent.role}
        </p>
      </CardContent>
    </Card>
  );
};
