/**
 * PersonalitiesList component displays all personalities in a single list interface.
 *
 * Features:
 * - Single list view for all personalities
 * - Static personality data (no loading states)
 * - All personalities editable (no read-only restrictions)
 * - Alphabetical sorting by name
 * - Responsive design with accessibility support
 * - Memoized for performance
 *
 * @module components/settings/PersonalitiesList
 */

import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import { Plus } from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { PersonalityCard } from "./PersonalityCard";

interface PersonalitiesListProps {
  personalities: readonly PersonalityViewModel[];
  onCreateClick?: () => void;
  onEdit?: (personality: PersonalityViewModel) => void;
  onDelete?: (personality: PersonalityViewModel) => void;
  className?: string;
}

export const PersonalitiesList = memo<PersonalitiesListProps>(
  function PersonalitiesList({
    personalities,
    onCreateClick = () => {},
    onEdit = () => {},
    onDelete = () => {},
    className,
  }) {
    // Sort personalities alphabetically by name
    const sortedPersonalities = useMemo(() => {
      return [...personalities].sort((a, b) => a.name.localeCompare(b.name));
    }, [personalities]);

    return (
      <div className={cn("personalities-list flex flex-col h-full", className)}>
        {/* Accessible heading for screen readers */}
        <h2 className="sr-only">All Personalities List</h2>

        {/* Personality list area */}
        <div className="flex-1">
          <div
            className="space-y-4"
            role="list"
            aria-label={`${sortedPersonalities.length} personalities available`}
            aria-describedby="personalities-list-description"
          >
            {/* Hidden description for screen readers */}
            <div id="personalities-list-description" className="sr-only">
              List of {sortedPersonalities.length} available personalities. Use
              Tab to navigate through personality items and their action
              buttons.
            </div>

            {sortedPersonalities.map((personality) => (
              <div key={personality.id} role="listitem">
                <PersonalityCard
                  personality={personality}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Create button container - always visible at bottom */}
        <div className="pt-6 border-t border-border mt-6">
          <Button
            onClick={onCreateClick}
            className="w-full gap-2"
            size="lg"
            aria-label="Create a new personality"
          >
            <Plus className="h-4 w-4" />
            Create Personality
          </Button>
        </div>
      </div>
    );
  },
);
