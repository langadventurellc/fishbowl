/**
 * PersonalitiesSection component provides unified personalities management interface.
 *
 * Features:
 * - Unified view showing saved personalities and create form
 * - Responsive design and accessibility compliance
 * - Simplified single-screen layout
 *
 * @module components/settings/PersonalitiesSection
 */

import {
  type Personality,
  type PersonalityFormData,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { CreatePersonalityForm } from "./CreatePersonalityForm";
import { SavedPersonalitiesTab } from "./SavedPersonalitiesTab";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "PersonalitiesSection", level: "info" },
});

export const PersonalitiesSection: React.FC = () => {
  const handleEditPersonality = useCallback((personality: Personality) => {
    // TODO: Implement editing functionality
    logger.info("Edit personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
  }, []);

  const handleClonePersonality = useCallback((personality: Personality) => {
    // TODO: Implement cloning functionality
    logger.info("Clone personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
  }, []);

  const handleSavePersonality = useCallback((data: PersonalityFormData) => {
    // TODO: Implement save functionality
    logger.info("Save personality requested", { personalityName: data.name });
  }, []);

  const handleCancelEditing = useCallback(() => {
    // TODO: Implement cancel functionality
    logger.info("Cancel editing requested");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Personalities</h1>
        <p className="text-muted-foreground mb-6">
          Manage agent personalities and their characteristics.
        </p>
      </div>

      <div className="space-y-8">
        {/* Saved Personalities Section */}
        <SavedPersonalitiesTab
          onEdit={handleEditPersonality}
          onClone={handleClonePersonality}
        />

        {/* Create New Personality Section */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Create New Personality</h2>
          <CreatePersonalityForm
            onSave={handleSavePersonality}
            onCancel={handleCancelEditing}
          />
        </div>
      </div>
    </div>
  );
};
