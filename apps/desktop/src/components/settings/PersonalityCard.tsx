/**
 * PersonalityCard component displays individual personality information with Big Five traits.
 *
 * Features:
 * - Prominent personality name display
 * - Big Five traits in compact "O:70 C:85 E:40 A:45 N:30" format
 * - Edit and Clone buttons with accessibility
 * - Hover effects with elevation changes
 * - Responsive design and proper touch targets
 * - Consistent styling with design system
 *
 * @module components/settings/PersonalityCard
 */

import type { Personality, PersonalityCardProps } from "@fishbowl-ai/ui-shared";
import { Copy, Edit } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const PersonalityCard: React.FC<PersonalityCardProps> = ({
  personality,
  onEdit,
  onClone,
}) => {
  const formatTraits = (traits: Personality["bigFive"]) => {
    return `O:${traits.openness} C:${traits.conscientiousness} E:${traits.extraversion} A:${traits.agreeableness} N:${traits.neuroticism}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
  );
};
