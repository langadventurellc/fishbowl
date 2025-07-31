import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";

export const AdvancedSettings: React.FC = () => {
  // Developer Options state management
  const [debugMode, setDebugMode] = useState(false);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  // Loading states for accessibility announcements
  const [isClearing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Advanced configuration options for power users.
        </p>
      </div>

      {/* Live regions for screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isClearing && "Clearing conversations..."}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Developer Options</h2>
          <div className="grid gap-6">
            {/* Debug Mode Toggle with enhanced accessibility */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode" className="text-base">
                  Enable debug logging
                </Label>
                <div
                  id="debug-help"
                  className="text-description text-muted-foreground"
                >
                  Show detailed logs in developer console
                </div>
              </div>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
                aria-describedby="debug-help"
                aria-label="Toggle debug logging on or off"
              />
            </div>

            {/* Experimental Features Toggle with warning context */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="experimental-features" className="text-base">
                  Enable experimental features
                </Label>
                <div
                  id="experimental-help"
                  className="text-description text-muted-foreground"
                >
                  Access features currently in development
                </div>
                <div
                  id="experimental-warning"
                  role="alert"
                  className="text-description text-amber-600 dark:text-amber-400 flex items-center gap-1"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  May cause instability
                </div>
              </div>
              <Switch
                id="experimental-features"
                checked={experimentalFeatures}
                onCheckedChange={setExperimentalFeatures}
                aria-describedby="experimental-help experimental-warning"
                aria-label="Toggle experimental features with instability risk"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
