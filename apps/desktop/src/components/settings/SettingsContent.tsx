/**
 * SettingsContent component provides responsive content area for settings modal.
 *
 * Features:
 * - Responsive padding that adjusts based on screen size
 * - Full width on mobile when navigation is collapsed
 * - Maximum content width constraint for readability
 * - Placeholder content for each settings section
 */

import React from "react";
import { cn } from "../../lib/utils";

interface SettingsContentProps {
  activeSection: string;
  className?: string;
}

export function SettingsContent({
  activeSection,
  className,
}: SettingsContentProps) {
  return (
    <div
      className={cn(
        // Base content styling
        "flex-1 overflow-auto",
        // Responsive padding
        "p-4 sm:p-6 lg:p-8",
        // Full width on mobile when navigation is collapsed
        "max-[800px]:w-full",
        // Adjusted width when navigation is visible
        "min-[801px]:flex-1",
        // Background for content area
        "bg-background",
        className,
      )}
    >
      <div className="max-w-3xl mx-auto">
        {renderSectionContent(activeSection)}
      </div>
    </div>
  );
}

function renderSectionContent(section: string) {
  switch (section) {
    case "general":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">General Preferences</h2>
            <p className="text-muted-foreground mb-6">
              Configure general application preferences and behavior.
            </p>
          </div>

          {/* Placeholder content sections */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Auto Mode Settings</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Response Delay</label>
                  <div className="h-10 bg-muted rounded border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Maximum Messages
                  </label>
                  <div className="h-10 bg-muted rounded border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Maximum Wait Time
                  </label>
                  <div className="h-10 bg-muted rounded border" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conversation Defaults</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Mode</label>
                  <div className="h-10 bg-muted rounded border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Agents</label>
                  <div className="h-10 bg-muted rounded border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "api-keys":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">API Keys</h2>
            <p className="text-muted-foreground mb-6">
              Manage API keys for various AI services and integrations.
            </p>
          </div>

          <div className="space-y-4">
            {["OpenAI", "Anthropic", "Google", "Other Providers"].map(
              (provider) => (
                <div key={provider} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{provider}</h3>
                    <div className="w-2 h-2 bg-muted rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="h-10 bg-muted rounded border" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 bg-muted rounded border flex-1" />
                    <div className="h-9 bg-muted rounded border w-16" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      );

    case "appearance":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Appearance</h2>
            <p className="text-muted-foreground mb-6">
              Customize the appearance and theme of the application.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Light", "Dark", "System"].map((theme) => (
                  <div key={theme} className="border rounded-lg p-4 space-y-2">
                    <div className="h-16 bg-muted rounded" />
                    <div className="text-sm font-medium text-center">
                      {theme}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Display Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded border" />
                  <label className="text-sm">Show timestamps</label>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded border" />
                  <label className="text-sm">Show conversation list</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "agents":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Agents</h2>
            <p className="text-muted-foreground mb-6">
              Configure AI agents and their behavior settings.
            </p>
          </div>

          {/* Tab navigation placeholder */}
          <div className="border-b">
            <div className="flex space-x-8">
              {["Library", "Templates", "Defaults"].map((tab) => (
                <div
                  key={tab}
                  className="py-2 px-1 border-b-2 border-transparent"
                >
                  <span className="text-sm font-medium">{tab}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-10 bg-muted rounded border" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "personalities":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Personalities</h2>
            <p className="text-muted-foreground mb-6">
              Manage agent personalities and their characteristics.
            </p>
          </div>

          {/* Tab navigation placeholder */}
          <div className="border-b">
            <div className="flex space-x-8">
              {["Saved", "Create New"].map((tab) => (
                <div
                  key={tab}
                  className="py-2 px-1 border-b-2 border-transparent"
                >
                  <span className="text-sm font-medium">{tab}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Big Five Personality Traits
              </h3>
              <div className="space-y-4">
                {[
                  "Openness",
                  "Conscientiousness",
                  "Extraversion",
                  "Agreeableness",
                  "Neuroticism",
                ].map((trait) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">{trait}</label>
                      <span className="text-sm text-muted-foreground">50%</span>
                    </div>
                    <div className="h-2 bg-muted rounded">
                      <div className="h-2 bg-primary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "roles":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Roles</h2>
            <p className="text-muted-foreground mb-6">
              Define and configure agent roles and permissions.
            </p>
          </div>

          {/* Tab navigation placeholder */}
          <div className="border-b">
            <div className="flex space-x-8">
              {["Predefined", "Custom"].map((tab) => (
                <div
                  key={tab}
                  className="py-2 px-1 border-b-2 border-transparent"
                >
                  <span className="text-sm font-medium">{tab}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[
              "Developer",
              "Designer",
              "Writer",
              "Analyst",
              "Researcher",
              "Assistant",
            ].map((role) => (
              <div key={role} className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{role}</h3>
                <p className="text-sm text-muted-foreground">
                  Role description and capabilities
                </p>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "advanced":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Options</h2>
            <p className="text-muted-foreground mb-6">
              Advanced configuration options for power users.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Export Data", "Import Data", "Clear Data"].map((action) => (
                  <div
                    key={action}
                    className="h-10 bg-muted rounded border flex items-center justify-center"
                  >
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Developer Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded border" />
                  <label className="text-sm">Debug mode</label>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded border" />
                  <label className="text-sm">Experimental features</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground mb-6">
              Select a section from the navigation to configure settings.
            </p>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Choose a settings category to get started
            </p>
          </div>
        </div>
      );
  }
}
