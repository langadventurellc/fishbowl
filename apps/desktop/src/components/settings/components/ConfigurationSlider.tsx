import type { ConfigurationSliderProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export const ConfigurationSlider: React.FC<ConfigurationSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  description,
  tooltip,
  formatValue = (v) => v.toString(),
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm font-medium cursor-help">{label}</Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-sm font-mono font-semibold text-primary">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};
