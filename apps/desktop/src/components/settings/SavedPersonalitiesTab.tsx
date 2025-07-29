/**
 * SavedPersonalitiesTab component displays saved personalities with edit/clone actions.
 *
 * Features:
 * - Grid layout of personality cards
 * - Big Five trait preview in compact format
 * - Edit and Clone buttons with accessibility
 * - Empty state for no saved personalities
 * - Responsive design across screen sizes
 *
 * @module components/settings/SavedPersonalitiesTab
 */

import React from "react";
import { PersonalityCard } from "./PersonalityCard";
import type { Personality } from "@fishbowl-ai/shared";

interface SavedPersonalitiesTabProps {
  onEdit: (personality: Personality) => void;
  onClone: (personality: Personality) => void;
}

export const SavedPersonalitiesTab: React.FC<SavedPersonalitiesTabProps> = ({
  onEdit,
  onClone,
}) => {
  // Mock data - will be replaced with actual store data
  const personalities: Personality[] = [];

  if (personalities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No personalities saved. Create your first personality!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personalities.map((personality) => (
        <PersonalityCard
          key={personality.id}
          personality={personality}
          onEdit={onEdit}
          onClone={onClone}
        />
      ))}
    </div>
  );
};
