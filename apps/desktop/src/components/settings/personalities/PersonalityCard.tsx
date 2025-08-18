/**
 * PersonalityCard component displays individual personality information for list display.
 *
 * Features:
 * - Prominent personality name display
 * - Behavior count display
 * - Custom instructions preview with truncation
 * - Big Five traits summary
 * - Edit and Delete buttons with accessibility
 * - Hover effects matching RoleCard design
 * - Consistent styling with design system
 *
 * @module components/settings/PersonalityCard
 */

import type {
  PersonalityCardProps,
  PersonalityViewModel,
} from "@fishbowl-ai/ui-shared";
import { Edit, Trash } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";

export const PersonalityCard: React.FC<PersonalityCardProps> = ({
  personality,
  onEdit,
  onDelete,
}) => {
  const behaviorCount = Object.keys(personality.behaviors).length;

  const customInstructionsPreview = personality.customInstructions
    ? personality.customInstructions.slice(0, 50) +
      (personality.customInstructions.length > 50 ? "..." : "")
    : "No custom instructions";

  const formatBigFiveTraits = (traits: PersonalityViewModel["bigFive"]) => {
    return `O:${traits.openness} C:${traits.conscientiousness} E:${traits.extraversion} A:${traits.agreeableness} N:${traits.neuroticism}`;
  };

  const handleEdit = () => {
    onEdit(personality);
  };

  const handleDelete = () => {
    onDelete(personality);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{personality.name}</CardTitle>
        <CardDescription>
          {behaviorCount} behaviors • {customInstructionsPreview}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground font-mono">
          {formatBigFiveTraits(personality.bigFive)}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
