/**
 * PersonalityCard component displays individual personality information for list display.
 *
 * Features:
 * - Prominent personality name display
 * - Behavior count display
 * - Custom instructions preview with truncation
 * - Edit and Delete buttons with accessibility
 * - Hover effects matching RoleCard design
 * - Consistent styling with design system
 *
 * @module components/settings/PersonalityCard
 */

import type { PersonalityCardProps } from "@fishbowl-ai/ui-shared";
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
          Add something here
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
