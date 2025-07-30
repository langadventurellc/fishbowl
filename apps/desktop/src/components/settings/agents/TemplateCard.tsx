/**
 * TemplateCard component displays individual agent template information with Use Template functionality.
 *
 * Features:
 * - Prominent template icon centered at top
 * - Template name and model display
 * - Description text with line clamping
 * - Use Template button with primary styling
 * - Accessibility attributes and keyboard navigation
 * - Smooth hover animations and responsive design
 *
 * @module components/settings/agents/TemplateCard
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import {
  BookOpen,
  Code,
  PenTool,
  BarChart3,
  Calendar,
  Palette,
  FileText,
  TrendingUp,
  Users,
  Brain,
  type LucideIcon,
} from "lucide-react";
import type { TemplateCardProps } from "@fishbowl-ai/shared";

// Icon mapping for template icons
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Code,
  PenTool,
  BarChart3,
  Calendar,
  Palette,
  FileText,
  TrendingUp,
  Users,
  Brain,
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUseTemplate,
  className,
}) => {
  const IconComponent = iconMap[template.icon] || BookOpen;

  const handleUseTemplate = () => {
    onUseTemplate?.(template.id);
  };

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-[var(--dt-animation-hover-transition)] group cursor-pointer h-full flex flex-col",
        className,
      )}
    >
      <CardHeader className="pb-4 lg:pb-6 text-center">
        <div className="flex flex-col items-center gap-3 lg:gap-4">
          <div className="p-3 lg:p-4 bg-muted rounded-lg group-hover:bg-accent/20 transition-colors">
            <IconComponent className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium leading-tight">
              {template.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {template.configuration.model}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
          {template.description}
        </p>
        <Button
          className="w-full"
          variant="default"
          size="sm"
          onClick={handleUseTemplate}
          aria-label={`Use ${template.name} template`}
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};
