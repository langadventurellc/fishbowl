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
import { useUnsavedChanges } from "@fishbowl-ai/ui-shared";
import React from "react";
import type { GeneralSettingsProps } from "../../types/GeneralSettingsProps";

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  form,
  isLoading: _isLoading = false,
  error: _error = null,
}) => {
  const { setUnsavedChanges } = useUnsavedChanges();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">General</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Configure general application preferences and behavior.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6" data-testid="general-settings-form">
          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">Auto Mode Settings</h2>
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
                          onValueChange={(value) => {
                            const newValue = (value[0] || 1) * 1000;
                            field.onChange(newValue);
                            // Directly set unsaved changes to true
                            setUnsavedChanges(true);
                          }} // Convert seconds to ms
                          className="w-full"
                          aria-describedby="responseDelay-description responseDelay-value"
                          aria-label="Response delay in seconds"
                        />
                        <div
                          id="responseDelay-value"
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                          aria-atomic="true"
                          role="status"
                        >
                          {field.value / 1000}{" "}
                          {field.value / 1000 === 1 ? "second" : "seconds"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription
                      id="responseDelay-description"
                      className="text-description text-muted-foreground mt-1"
                    >
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
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            // Directly set unsaved changes to true
                            setUnsavedChanges(true);
                          }}
                          onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel changes
                          className="w-full"
                          data-testid="maximum-messages-input"
                        />
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value === 0
                            ? "Unlimited"
                            : `${field.value} message${field.value !== 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-description text-muted-foreground mt-1">
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
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value / 1000}{" "}
                          {field.value / 1000 === 1 ? "second" : "seconds"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-description text-muted-foreground mt-1">
                      Maximum time to wait for agent response
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">
              Conversation Defaults
            </h2>
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
                        aria-describedby="defaultMode-description"
                        data-testid="default-mode-radio-group"
                      >
                        <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                          <RadioGroupItem value="manual" id="mode-manual" />
                          <Label
                            htmlFor="mode-manual"
                            className="text-sm font-normal flex-1 py-2 cursor-pointer"
                          >
                            Manual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                          <RadioGroupItem value="auto" id="mode-auto" />
                          <Label
                            htmlFor="mode-auto"
                            className="text-sm font-normal flex-1 py-2 cursor-pointer"
                          >
                            Auto
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription
                      id="defaultMode-description"
                      className="text-description text-muted-foreground mt-1"
                    >
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
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value} agent{field.value !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-description text-muted-foreground mt-1">
                      Limit the number of agents in a conversation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">Other Settings</h2>
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
                      <FormDescription className="text-description text-muted-foreground mt-1">
                        Check for new versions on startup
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          // Directly set unsaved changes to true
                          setUnsavedChanges(true);
                        }}
                        data-testid="check-updates-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};
