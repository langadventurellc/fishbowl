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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Copy } from "lucide-react";

interface Personality {
  id: string;
  name: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behaviors: Record<string, number>;
  customInstructions: string;
}

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

  const formatTraits = (traits: Personality["bigFive"]) => {
    return `O:${traits.openness} C:${traits.conscientiousness} E:${traits.extraversion} A:${traits.agreeableness} N:${traits.neuroticism}`;
  };

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
        <Card
          key={personality.id}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{personality.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(personality)}
                  aria-label={`Edit ${personality.name}`}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClone(personality)}
                  aria-label={`Clone ${personality.name}`}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-mono">
              {formatTraits(personality.bigFive)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
