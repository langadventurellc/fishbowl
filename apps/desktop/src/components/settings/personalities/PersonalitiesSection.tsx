/**
 * PersonalitiesSection component integrates personalities management with TabContainer.
 *
 * Features:
 * - Tab navigation between Saved and Create New tabs
 * - Unsaved changes protection when switching tabs
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 *
 * @module components/settings/PersonalitiesSection
 */

import {
  useSettingsNavigation,
  useUnsavedChanges,
  type PersonalitiesSectionProps,
  type Personality,
  type PersonalityFormData,
  type TabConfiguration,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { useConfirmationDialog } from "../../../hooks/useConfirmationDialog";
import { TabContainer } from "../TabContainer";
import { CreatePersonalityForm } from "./CreatePersonalityForm";
import { SavedPersonalitiesTab } from "./SavedPersonalitiesTab";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "PersonalitiesSection", level: "info" },
});

export const PersonalitiesSection: React.FC<PersonalitiesSectionProps> = () => {
  const { activeSubTab } = useSettingsNavigation();
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { showConfirmation } = useConfirmationDialog();

  const handleEditPersonality = useCallback((personality: Personality) => {
    // Switch to Create New tab with pre-filled data for editing
    // This will be implemented when the form component is ready
    logger.info("Edit personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
  }, []);

  const handleClonePersonality = useCallback((personality: Personality) => {
    // Switch to Create New tab with cloned data
    logger.info("Clone personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
  }, []);

  const handleSavePersonality = useCallback((data: PersonalityFormData) => {
    // Save personality and switch back to Saved tab
    logger.info("Save personality requested", { personalityName: data.name });
  }, []);

  const handleCancelEditing = useCallback(() => {
    // Cancel editing and return to previous tab or Saved tab
    logger.info("Cancel editing requested");
  }, []);

  const handleTabChange = useCallback(async () => {
    // Check for unsaved changes when leaving Create New tab
    if (activeSubTab === "create-new" && hasUnsavedChanges) {
      const shouldProceed = await showConfirmation({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Do you want to discard them?",
        confirmText: "Discard Changes",
        cancelText: "Keep Editing",
      });
      if (!shouldProceed) return;
    }

    // Tab change will be handled by store via TabContainer
  }, [activeSubTab, hasUnsavedChanges, showConfirmation]);

  const tabs: TabConfiguration[] = [
    {
      id: "saved",
      label: "Saved",
      content: () => (
        <SavedPersonalitiesTab
          onEdit={handleEditPersonality}
          onClone={handleClonePersonality}
        />
      ),
    },
    {
      id: "create-new",
      label: "Create New",
      content: () => (
        <CreatePersonalityForm
          onSave={handleSavePersonality}
          onCancel={handleCancelEditing}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Personalities</h1>
        <p className="text-muted-foreground mb-6">
          Manage agent personalities and their characteristics.
        </p>
      </div>

      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="personalities-tabs"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
