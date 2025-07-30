import type { CharacterCounterProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../../lib/utils";

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className,
}) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <span
      className={cn(
        "text-xs",
        isOverLimit
          ? "text-destructive"
          : isNearLimit
            ? "text-warning"
            : "text-muted-foreground",
        className,
      )}
    >
      {current}/{max}
    </span>
  );
};
