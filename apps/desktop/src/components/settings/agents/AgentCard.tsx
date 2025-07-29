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
    <Card className={cn("hover:shadow-md transition-shadow group", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{agent.model}</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleEdit}
              aria-label={`Edit ${agent.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDelete}
              aria-label={`Delete ${agent.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{agent.role}</p>
      </CardContent>
    </Card>
  );
};
