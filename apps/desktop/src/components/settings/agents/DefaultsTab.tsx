/**
 * DefaultsTab component for configuring agent default settings.
 *
 * Features:
 * - Temperature slider (0-2) with real-time descriptions
 * - Max tokens input (1-4000) with validation
 * - Top P slider (0-1) with real-time descriptions
 * - Reset to defaults button with confirmation dialog
 * - Real-time preview panel
 * - Full accessibility support with ARIA labels and screen reader announcements
 * - Keyboard navigation support
 *
 * @module components/settings/agents/DefaultsTab
 */

import { type AgentDefaults } from "@fishbowl-ai/ui-shared";
import React, { useCallback, useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { getSliderDescription } from "../../../utils/sliderDescriptions";
import { createSliderKeyHandler } from "../../../utils/sliderKeyboardHandler";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

/**
 * Defaults tab component with configuration sliders and inputs.
 */
export const DefaultsTab: React.FC = () => {
  const defaultSettings = useMemo(
    (): AgentDefaults => ({
      temperature: 1.0,
      maxTokens: 1000,
      topP: 0.95,
    }),
    [],
  );

  const [settings, setSettings] = useState<AgentDefaults>(defaultSettings);
  const [isResetting, setIsResetting] = useState(false);

  const debouncedAnnouncement = useDebounce((...args: unknown[]) => {
    const [setting, value] = args as [string, number];
    announceToScreenReader(`${setting} set to ${value}`, "polite");
  }, 300);

  const handleTemperatureChange = useCallback(
    (values: number[]) => {
      const newValue = values[0] ?? 1.0;
      setSettings((prev) => ({ ...prev, temperature: newValue }));
      debouncedAnnouncement("Temperature", newValue);
    },
    [debouncedAnnouncement],
  );

  const handleTopPChange = useCallback(
    (values: number[]) => {
      const newValue = values[0] ?? 0.95;
      setSettings((prev) => ({ ...prev, topP: newValue }));
      debouncedAnnouncement("Top P", newValue);
    },
    [debouncedAnnouncement],
  );

  const handleMaxTokensChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Math.max(
        1,
        Math.min(4000, parseInt(e.target.value) || 1000),
      );
      setSettings((prev) => ({ ...prev, maxTokens: newValue }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    const confirmReset = confirm(
      "Are you sure you want to reset all settings to their default values?",
    );
    if (confirmReset) {
      setIsResetting(true);
      setSettings(defaultSettings);
      setTimeout(() => setIsResetting(false), 200);
      announceToScreenReader("Settings reset to defaults", "polite");
    }
  }, [defaultSettings]);

  return (
    <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Agent Defaults</h3>
        <p className="text-muted-foreground">
          Configure default settings for new agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
        {/* Settings Controls */}
        <div className="space-y-6">
          {/* Temperature Slider */}
          <div
            className="space-y-3"
            role="group"
            aria-labelledby="temperature-label"
          >
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    id="temperature-label"
                    htmlFor="temperature-slider"
                    className="text-sm font-medium cursor-help"
                  >
                    Temperature
                  </Label>
                </TooltipTrigger>
                <TooltipContent role="tooltip" id="temperature-tooltip">
                  <p>
                    Controls randomness in responses. Lower values (0.1-0.3) are
                    more focused and deterministic, higher values (1.5-2.0) are
                    more creative and varied.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                id="temperature-value"
                className="text-sm font-mono font-semibold text-primary"
                aria-live="polite"
                aria-atomic="true"
                role="status"
              >
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature-slider"
              value={[settings.temperature]}
              onValueChange={handleTemperatureChange}
              onKeyDown={createSliderKeyHandler(
                settings.temperature,
                0,
                2,
                0.1,
                (value) => handleTemperatureChange([value]),
                getSliderDescription.temperature,
                announceToScreenReader,
              )}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
              aria-label="Temperature setting from 0 to 2"
              aria-describedby="temperature-tooltip temperature-help"
              aria-valuetext={`${settings.temperature.toFixed(1)} - ${getSliderDescription.temperature(settings.temperature)}`}
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={settings.temperature}
            />
            <div id="temperature-help" className="sr-only">
              Use arrow keys to adjust temperature. Press Home for minimum (0),
              End for maximum (2), Page Up/Down for larger increments. Current
              setting: {getSliderDescription.temperature(settings.temperature)}
            </div>
          </div>

          {/* Max Tokens Input */}
          <div
            className="space-y-3"
            role="group"
            aria-labelledby="max-tokens-label"
          >
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    id="max-tokens-label"
                    htmlFor="max-tokens-input"
                    className="text-sm font-medium cursor-help"
                  >
                    Max Tokens
                  </Label>
                </TooltipTrigger>
                <TooltipContent role="tooltip" id="max-tokens-tooltip">
                  <p>
                    Maximum length of generated responses. Typical range:
                    100-4000 tokens.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="max-tokens-input"
              type="number"
              value={settings.maxTokens}
              onChange={handleMaxTokensChange}
              min={1}
              max={4000}
              className="w-full"
              aria-label="Maximum tokens for responses"
              aria-describedby="max-tokens-tooltip max-tokens-help"
              aria-valuemin={1}
              aria-valuemax={4000}
              aria-valuenow={settings.maxTokens}
              aria-valuetext={getSliderDescription.maxTokens(
                settings.maxTokens,
              )}
            />
            <div id="max-tokens-help" className="sr-only">
              Enter a number between 1 and 4000. Current setting:{" "}
              {getSliderDescription.maxTokens(settings.maxTokens)}
            </div>
          </div>

          {/* Top P Slider */}
          <div className="space-y-3" role="group" aria-labelledby="top-p-label">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    id="top-p-label"
                    htmlFor="top-p-slider"
                    className="text-sm font-medium cursor-help"
                  >
                    Top P
                  </Label>
                </TooltipTrigger>
                <TooltipContent role="tooltip" id="top-p-tooltip">
                  <p>
                    Controls diversity by limiting token selection. Lower values
                    focus on likely tokens, higher values allow more variety.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                id="top-p-value"
                className="text-sm font-mono font-semibold text-primary"
                aria-live="polite"
                aria-atomic="true"
                role="status"
              >
                {settings.topP.toFixed(2)}
              </span>
            </div>
            <Slider
              id="top-p-slider"
              value={[settings.topP]}
              onValueChange={handleTopPChange}
              onKeyDown={createSliderKeyHandler(
                settings.topP,
                0,
                1,
                0.01,
                (value) => handleTopPChange([value]),
                getSliderDescription.topP,
                announceToScreenReader,
              )}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
              aria-label="Top P setting from 0 to 1"
              aria-describedby="top-p-tooltip top-p-help"
              aria-valuetext={`${settings.topP.toFixed(2)} - ${getSliderDescription.topP(settings.topP)}`}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={settings.topP}
            />
            <div id="top-p-help" className="sr-only">
              Use arrow keys to adjust Top P. Press Home for minimum (0), End
              for maximum (1), Page Up/Down for larger increments. Current
              setting: {getSliderDescription.topP(settings.topP)}
            </div>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isResetting}
            className="w-full"
          >
            {isResetting ? "Resetting..." : "Reset to Defaults"}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Settings Preview</h4>
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="text-sm">
              <strong>Temperature ({settings.temperature.toFixed(1)}):</strong>{" "}
              {settings.temperature < 0.5
                ? "Very focused and deterministic responses"
                : settings.temperature < 1.0
                  ? "Moderately creative responses"
                  : settings.temperature < 1.5
                    ? "Creative and varied responses"
                    : "Highly creative and unpredictable responses"}
            </div>
            <div className="text-sm">
              <strong>Max Tokens ({settings.maxTokens}):</strong> Responses will
              be limited to approximately{" "}
              {Math.round(settings.maxTokens * 0.75)} words
            </div>
            <div className="text-sm">
              <strong>Top P ({settings.topP.toFixed(2)}):</strong>{" "}
              {settings.topP < 0.5
                ? "Very focused token selection"
                : settings.topP < 0.9
                  ? "Balanced token diversity"
                  : "High token diversity allowing creative choices"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
