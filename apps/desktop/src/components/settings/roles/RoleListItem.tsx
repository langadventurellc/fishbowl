/**
 * RoleListItem component displays individual role information in a list format.
 *
 * Features:
 * - Role name displayed prominently
 * - Description preview with truncation at word boundaries
 * - Right-aligned Edit and Delete buttons (ghost variant, small size)
 * - Loading states for operations
 * - Proper hover states and accessibility
 * - Memoization for performance
 *
 * @module components/settings/RoleListItem
 */

import type { RoleListItemProps } from "@fishbowl-ai/ui-shared";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "../../../lib/utils";
import { FOCUS_STYLES, getButtonFocus } from "../../../styles/focus";
import { truncateDescription } from "../../../utils";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardTitle } from "../../ui/card";

export const RoleListItem = memo<RoleListItemProps>(function RoleListItem({
  role,
  onEdit,
  onDelete,
  className,
}) {
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleEdit = async () => {
    setIsEditLoading(true);
    try {
      onEdit(role);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      onDelete(role);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "group relative",
        "border border-border/50 hover:border-border",
        "bg-card hover:bg-accent/5",
        "shadow-sm hover:shadow-md",
        "transition-all duration-[var(--dt-animation-hover-transition)]",
        "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground mb-1.5 leading-tight">
              {role.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {truncateDescription(role.description, 120)}
            </p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-[var(--dt-animation-hover-transition)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              disabled={isEditLoading || isDeleteLoading}
              aria-label={`Edit ${role.name} role`}
              className={cn(
                "h-8 px-3",
                "hover:bg-accent hover:text-accent-foreground",
                getButtonFocus("ghost", "sm", isEditLoading || isDeleteLoading),
                "transition-colors duration-[var(--dt-animation-hover-transition)]",
                isEditLoading && "opacity-50 cursor-wait",
              )}
            >
              {isEditLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Edit className="h-3.5 w-3.5 mr-1.5" />
              )}
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isEditLoading || isDeleteLoading}
              aria-label={`Delete ${role.name} role`}
              className={cn(
                "h-8 px-3",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10",
                FOCUS_STYLES.button,
                "transition-colors duration-[var(--dt-animation-hover-transition)]",
                isDeleteLoading && "opacity-50 cursor-wait",
              )}
            >
              {isDeleteLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});
