import { SettingsCardProps } from "@fishbowl-ai/ui-shared";
import { Edit2, Trash2 } from "lucide-react";
import React from "react";

import { cn } from "../../lib/utils";
import { FOCUS_STYLES } from "../../styles/focus";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export const SettingsCard = React.memo<SettingsCardProps>(
  ({ title, content, onEdit, onDelete, className }) => {
    return (
      <Card
        className={cn(
          "hover:shadow-md lg:hover:shadow-lg transition-all duration-[var(--dt-animation-hover-transition)] group",
          "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
          className,
        )}
        role="article"
        aria-labelledby={`settings-card-title-${title.toLowerCase().replace(/\s+/g, "-")}`}
        tabIndex={0}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle
              id={`settings-card-title-${title.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-lg"
            >
              {title}
            </CardTitle>
            <div
              className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
              role="toolbar"
              aria-label={`Actions for ${title}`}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", FOCUS_STYLES.button)}
                onClick={onEdit}
                aria-label={`Edit ${title}`}
              >
                <Edit2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", FOCUS_STYLES.button)}
                onClick={onDelete}
                aria-label={`Delete ${title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{content}</div>
        </CardContent>
      </Card>
    );
  },
);

SettingsCard.displayName = "SettingsCard";
