/**
 * RolesSection component integrates roles management with TabContainer.
 *
 * Features:
 * - Tab navigation between Predefined and Custom roles
 * - Centralized modal state management for CRUD operations
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 * - Only one modal open at a time for optimal UX
 *
 * @module components/settings/RolesSection
 */

import React, { useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { TabContainer } from "./TabContainer";
import { PredefinedRolesTab } from "./PredefinedRolesTab";
import { CustomRolesTab } from "./CustomRolesTab";
import { RoleFormModal } from "./RoleFormModal";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { useCustomRoles } from "@fishbowl-ai/shared";
import type {
  RolesSectionProps,
  TabConfiguration,
  CustomRole,
  RoleFormData,
} from "@fishbowl-ai/shared";

export const RolesSection: React.FC<RolesSectionProps> = ({ className }) => {
  // Modal state management - centralized to ensure only one modal open
  const [selectedRole, setSelectedRole] = useState<CustomRole | undefined>(
    undefined,
  );
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Store operations
  const { createRole, updateRole, deleteRole, isLoading } = useCustomRoles();

  // CRUD operation handlers
  const handleCreateRole = useCallback(() => {
    setFormMode("create");
    setSelectedRole(undefined);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleEditRole = useCallback((role: CustomRole) => {
    setFormMode("edit");
    setSelectedRole(role);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleDeleteRole = useCallback((role: CustomRole) => {
    setSelectedRole(role);
    setFormModalOpen(false); // Ensure only one modal open
    setDeleteDialogOpen(true);
  }, []);

  const handleSaveRole = useCallback(
    async (data: RoleFormData) => {
      try {
        if (formMode === "create") {
          await createRole(data);
        } else if (selectedRole) {
          await updateRole(selectedRole.id, data);
        }
        // Modal will close automatically on success
        setFormModalOpen(false);
        setSelectedRole(undefined);
      } catch (error) {
        // Error handling - modal stays open for retry
        console.error("Failed to save role:", error);
      }
    },
    [formMode, selectedRole, createRole, updateRole],
  );

  const handleConfirmDelete = useCallback(
    async (role: CustomRole) => {
      try {
        await deleteRole(role.id);
        setDeleteDialogOpen(false);
        setSelectedRole(undefined);
      } catch (error) {
        // Error handling - dialog stays open for retry
        console.error("Failed to delete role:", error);
      }
    },
    [deleteRole],
  );

  // Tab configuration with handler injection
  const tabs: TabConfiguration[] = [
    {
      id: "predefined",
      label: "Predefined",
      content: () => <PredefinedRolesTab />,
    },
    {
      id: "custom",
      label: "Custom",
      content: () => (
        <CustomRolesTab
          onCreateRole={handleCreateRole}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      ),
    },
  ];

  return (
    <div className={cn("roles-section", className)}>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="roles-tabs"
      />

      {/* Role creation/editing modal */}
      <RoleFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        role={selectedRole}
        onSave={handleSaveRole}
        isLoading={isLoading}
      />

      {/* Role deletion confirmation dialog */}
      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
