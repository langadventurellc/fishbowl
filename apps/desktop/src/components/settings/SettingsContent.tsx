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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "../../lib/utils";
import { getAccessibleDescription } from "@/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  generalSettingsSchema,
  type GeneralSettingsFormData,
  defaultGeneralSettings,
} from "@fishbowl-ai/shared";

const createProviderSections = (providers: string[]) =>
  providers.map((provider) => (
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
  ));

const GeneralSettings: React.FC = () => {
  // Initialize form with default values and validation
  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultGeneralSettings,
  });

  // Handle form submission (placeholder for now)
  const onSubmit = (data: GeneralSettingsFormData) => {
    console.log("Form data:", data);
    // TODO: Integrate with settings store in future tasks
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">General Preferences</h1>
        <p className="text-muted-foreground mb-6">
          Configure general application preferences and behavior.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Auto Mode Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="responseDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Delay</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={30}
                          step={1}
                          value={[field.value / 1000]} // Convert ms to seconds for slider
                          onValueChange={(value) =>
                            field.onChange((value[0] || 1) * 1000)
                          } // Convert seconds to ms
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground">
                          {field.value / 1000} second
                          {field.value / 1000 !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Time between agent responses in auto mode
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumMessages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Messages</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel changes
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground">
                          {field.value === 0
                            ? "Unlimited"
                            : `${field.value} messages`}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Stop auto mode after this many messages (0 = unlimited)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumWaitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Wait Time</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          {...field}
                          value={field.value / 1000} // Convert ms to seconds for display
                          onChange={(e) =>
                            field.onChange(
                              (parseInt(e.target.value) || 5) * 1000,
                            )
                          } // Convert seconds to ms
                          onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel changes
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground">
                          {field.value / 1000} seconds
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Maximum time to wait for agent response
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Conversation Defaults</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="defaultMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Default Conversation Mode</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="mode-manual" />
                          <Label
                            htmlFor="mode-manual"
                            className="text-sm font-normal"
                          >
                            Manual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="mode-auto" />
                          <Label
                            htmlFor="mode-auto"
                            className="text-sm font-normal"
                          >
                            Auto
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Default conversation mode for new conversations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumAgents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Agents</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground">
                          {field.value} agent{field.value !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Limit the number of agents in a conversation
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Other Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="checkUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Automatically check for updates
                      </FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Check for new versions on startup
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

const ApiKeysSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-muted-foreground mb-6">
        Manage API keys for various AI services and integrations.
      </p>
    </div>
    <div className="space-y-4">
      {createProviderSections([
        "OpenAI",
        "Anthropic",
        "Google",
        "Other Providers",
      ])}
    </div>
  </div>
);

const AppearanceSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Appearance</h1>
      <p className="text-muted-foreground mb-6">
        Customize the appearance and theme of the application.
      </p>
    </div>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Light", "Dark", "System"].map((theme) => (
            <div key={theme} className="border rounded-lg p-4 space-y-2">
              <div className="h-16 bg-muted rounded" />
              <div className="text-sm font-medium text-center">{theme}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Display Settings</h2>
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

const AgentsSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Agents</h1>
      <p className="text-muted-foreground mb-6">
        Configure AI agents and their behavior settings.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Library", "Templates", "Defaults"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
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

const PersonalitiesSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Personalities</h1>
      <p className="text-muted-foreground mb-6">
        Manage agent personalities and their characteristics.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Saved", "Create New"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
            <span className="text-sm font-medium">{tab}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Big Five Personality Traits</h2>
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

const RolesSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Roles</h1>
      <p className="text-muted-foreground mb-6">
        Define and configure agent roles and permissions.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Predefined", "Custom"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
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

const AdvancedSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Advanced Options</h1>
      <p className="text-muted-foreground mb-6">
        Advanced configuration options for power users.
      </p>
    </div>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
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
        <h2 className="text-lg font-semibold">Developer Options</h2>
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

const DefaultSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
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

const sectionComponents = {
  general: GeneralSettings,
  "api-keys": ApiKeysSettings,
  appearance: AppearanceSettings,
  agents: AgentsSettings,
  personalities: PersonalitiesSettings,
  roles: RolesSettings,
  advanced: AdvancedSettings,
} as const;

interface SettingsContentProps {
  activeSection: string;
  className?: string;
  contentId?: string; // New prop for ARIA relationships
}

export function SettingsContent({
  activeSection,
  className,
  contentId = "settings-content",
}: SettingsContentProps) {
  const Component =
    sectionComponents[activeSection as keyof typeof sectionComponents] ||
    DefaultSettings;

  // Get accessible description for current section
  const sectionDescription = getAccessibleDescription(activeSection);

  return (
    <main
      className={cn(
        // Base content styling
        "flex-1 overflow-y-scroll",
        // Responsive padding: 30px desktop, 20px reduced screens
        "min-[1000px]:p-[30px]",
        "max-[999px]:p-[20px]",
        // Full width when navigation is hidden/collapsed
        "max-[799px]:w-full",
        // Takes remaining width when navigation is visible
        "min-[800px]:flex-1",
        // Background for content area
        "bg-background",
        className,
      )}
      role="main"
      aria-label={`${activeSection} settings`}
      aria-describedby={`${contentId}-description`}
      aria-live="polite"
      aria-busy="false"
      id={contentId}
      tabIndex={-1}
    >
      {/* Hidden description for screen readers */}
      <div id={`${contentId}-description`} className="sr-only">
        {sectionDescription}. Use Tab to navigate between form controls. Changes
        are automatically saved.
      </div>

      {/* Section heading for screen readers */}
      <h2 className="sr-only">{activeSection} Settings Section</h2>

      {/* Maximum content width container with region role */}
      <div
        className="max-w-[600px] mx-auto"
        role="region"
        aria-labelledby={`${contentId}-section-title`}
      >
        {/* Dynamic section title for screen readers */}
        <h3 id={`${contentId}-section-title`} className="sr-only">
          Configure {activeSection} settings
        </h3>

        {/* Form wrapper with proper ARIA attributes */}
        <div
          role="group"
          aria-labelledby={`${contentId}-section-title`}
          aria-describedby={`${contentId}-description`}
        >
          <Component />
        </div>
      </div>
    </main>
  );
}
