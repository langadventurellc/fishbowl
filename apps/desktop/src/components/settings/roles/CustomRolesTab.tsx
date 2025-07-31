/**
 * CustomRolesTab component displays user-created roles in a scannable list format.
 *
 * Features:
 * - Chronological role display (newest first)
 * - Scrollable list for many roles (>10)
 * - Empty state with friendly message
 * - Create button with primary styling outside scrollable area
 * - Loading states with skeleton placeholders
 * - Responsive behavior and accessibility support
 *
 * @module components/settings/CustomRolesTab
 */

import {
  useCustomRoles,
  type CustomRolesTabProps,
} from "@fishbowl-ai/ui-shared";
import { Plus, Users } from "lucide-react";
import { memo, useMemo } from "react";
import { useRoleFormModal } from "../../../hooks/useRoleFormModal";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { CustomRoleListItem } from "./CustomRoleListItem";
import { RoleFormModal } from "./RoleFormModal";

export const CustomRolesTab = memo<CustomRolesTabProps>(
  function CustomRolesTab({
    onCreateRole,
    onEditRole,
    onDeleteRole,
    className,
  }) {
    const { roles, isLoading, error } = useCustomRoles();
    const {
      isOpen,
      mode,
      currentRole,
      isLoading: modalIsLoading,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSave,
    } = useRoleFormModal();

    // Determine whether to use internal or external handlers
    const usingExternalHandlers = !!(
      onCreateRole &&
      onEditRole &&
      onDeleteRole
    );

    // Use external handlers if provided, otherwise fall back to internal ones
    const handleCreate = onCreateRole || openCreateModal;
    const handleEdit = onEditRole || openEditModal;
    const handleDelete =
      onDeleteRole ||
      (() => {
        // Internal delete logic - just a placeholder for now
        console.log("Internal delete not implemented");
      });

    // Sort roles chronologically (newest first)
    const sortedRoles = useMemo(() => {
      return [...roles].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }, [roles]);

    // Loading state component
    const LoadingState = () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse w-48" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );

    // Empty state component
    const EmptyState = () => (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No custom roles created</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          Create your first custom role to define specialized agent behaviors
          for your specific needs.
        </p>
        <Button
          onClick={handleCreate}
          className="gap-2"
          aria-label="Create your first custom role"
        >
          <Plus className="h-4 w-4" />
          Create Custom Role
        </Button>
      </div>
    );

    // Error state component
    const ErrorState = () => (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Users className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Unable to load custom roles
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          {error ||
            "An error occurred while loading your custom roles. Please try again."}
        </p>
      </div>
    );

    if (error) {
      return <ErrorState />;
    }

    if (isLoading) {
      return (
        <div className={cn("custom-roles-tab", className)}>
          <LoadingState />
        </div>
      );
    }

    if (sortedRoles.length === 0) {
      return (
        <div className={cn("custom-roles-tab", className)}>
          <EmptyState />
        </div>
      );
    }

    return (
      <div className={cn("custom-roles-tab flex flex-col h-full", className)}>
        {/* Accessible heading for screen readers */}
        <h2 className="sr-only">Custom Roles List</h2>

        {/* Scrollable role list area */}
        <div className="flex-1 min-h-0">
          <div
            className="max-h-[var(--dt-scrollable-list-max-height)] overflow-y-auto space-y-4 pr-[var(--dt-scrollable-container-padding-right)]"
            role="list"
            aria-label={`${sortedRoles.length} custom roles`}
            aria-describedby="custom-roles-description"
          >
            {/* Hidden description for screen readers */}
            <div id="custom-roles-description" className="sr-only">
              List of {sortedRoles.length} custom roles, sorted by creation date
              with newest first. Use Tab to navigate through role items and
              their action buttons.
            </div>

            {sortedRoles.map((role) => (
              <div key={role.id} role="listitem">
                <CustomRoleListItem
                  role={role}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Create button container - always visible at bottom */}
        <div className="pt-6 border-t border-border mt-6">
          <Button
            onClick={handleCreate}
            className="w-full gap-2"
            size="lg"
            aria-label="Create a new custom role"
          >
            <Plus className="h-4 w-4" />
            Create Custom Role
          </Button>
        </div>

        {/* Role creation/editing modal - only render if using internal handlers */}
        {!usingExternalHandlers && (
          <RoleFormModal
            isOpen={isOpen}
            onOpenChange={closeModal}
            mode={mode}
            role={currentRole}
            onSave={handleSave}
            isLoading={modalIsLoading}
          />
        )}
      </div>
    );
  },
);
