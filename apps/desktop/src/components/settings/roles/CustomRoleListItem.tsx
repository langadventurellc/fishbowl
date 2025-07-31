/**
 * CustomRoleListItem component displays individual custom role information in a list format.
 *
 * Features:
 * - Role name displayed prominently
 * - Description preview with truncation at word boundaries
 * - Right-aligned Edit and Delete buttons (ghost variant, small size)
 * - Loading states for operations
 * - Proper hover states and accessibility
 * - Memoization for performance
 *
 * @module components/settings/CustomRoleListItem
 */

import type { CustomRoleListItemProps } from "@fishbowl-ai/ui-shared";
import { Edit, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "../../../lib/utils";
import { truncateDescription } from "../../../utils";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardTitle } from "../../ui/card";

export const CustomRoleListItem = memo<CustomRoleListItemProps>(
  function CustomRoleListItem({ role, onEdit, onDelete, className }) {
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
          "hover:shadow-sm transition-shadow duration-[var(--dt-animation-hover-transition)]",
          className,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium mb-1">
                {role.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {truncateDescription(role.description)}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isEditLoading || isDeleteLoading}
                aria-label={`Edit ${role.name} role`}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isEditLoading || isDeleteLoading}
                aria-label={`Delete ${role.name} role`}
                className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  },
);
