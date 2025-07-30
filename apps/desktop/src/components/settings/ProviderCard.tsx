import type { ProviderCardProps } from "@fishbowl-ai/ui-shared";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  X,
} from "lucide-react";
import React from "react";
import { useIsCompactViewport } from "../../hooks";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Input } from "../ui/input";

export function ProviderCard({
  provider,
  apiKey,
  baseUrl,
  status,
  showApiKey,
  showAdvanced,
  onApiKeyChange,
  onBaseUrlChange,
  onToggleApiKey,
  onToggleAdvanced,
  onTest,
  errors,
  isValidating = false,
}: ProviderCardProps) {
  const isCompactViewport = useIsCompactViewport();
  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case "error":
        return <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      case "untested":
      default:
        return <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return (
          <span className="text-xs sm:text-sm text-green-600">Connected</span>
        );
      case "error":
        return (
          <span className="text-xs sm:text-sm text-red-600">Not connected</span>
        );
      case "untested":
      default:
        return (
          <span className="text-xs sm:text-sm text-gray-400">
            Not connected
          </span>
        );
    }
  };

  return (
    <Card className="w-full border border-border rounded-lg">
      <CardContent className="p-4 sm:p-5 md:p-6">
        {/* Provider Header - Responsive typography */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            {provider.name}
          </h3>
        </div>

        {/* Form Fields - Responsive spacing */}
        <div className="space-y-3 sm:space-y-4">
          {/* API Key Field - Mobile-optimized input */}
          <div className="space-y-2">
            <label
              htmlFor={`${provider.id}-api-key`}
              className="text-sm font-medium"
            >
              API Key
            </label>
            <div className="relative">
              <Input
                id={`${provider.id}-api-key`}
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onApiKeyChange(e.target.value)
                }
                className={cn(
                  "pr-10 text-sm sm:text-base",
                  errors?.apiKey &&
                    "border-red-500 focus:border-red-500 focus:ring-red-200",
                )}
                // Compact viewport placeholder
                placeholder={
                  isCompactViewport
                    ? "Enter API key"
                    : `Enter your ${provider.name} API key`
                }
                // Mobile-specific attributes
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
                aria-invalid={!!errors?.apiKey}
                aria-describedby={
                  errors?.apiKey
                    ? `${provider.id}-api-key-error ${provider.id}-api-key-description`
                    : `${provider.id}-api-key-description`
                }
              />
              {/* Touch-friendly toggle button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent",
                  // Touch-friendly sizing on mobile
                  "h-6 w-6 sm:h-8 sm:w-8",
                  // Ensure minimum 44px touch target on mobile
                  "min-h-[var(--dt-touch-min-mobile)] min-w-[var(--dt-touch-min-mobile)] sm:min-h-[var(--dt-touch-min-desktop)] sm:min-w-[var(--dt-touch-min-desktop)]",
                )}
                onClick={onToggleApiKey}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
            {errors?.apiKey && (
              <p
                id={`${provider.id}-api-key-error`}
                className="text-xs sm:text-sm text-red-600 flex items-center gap-1 break-words"
                role="alert"
                aria-live="polite"
              >
                <AlertTriangle className="h-3 w-3" />
                {errors.apiKey}
              </p>
            )}
            <div
              id={`${provider.id}-api-key-description`}
              className="sr-only"
              aria-live="polite"
            >
              API key is {showApiKey ? "visible" : "hidden"}
            </div>
          </div>

          {/* Responsive Status Indicators */}
          <div className="flex items-center gap-1 sm:gap-2">
            {getStatusIcon()}
            {getStatusText()}
          </div>

          {/* Test Button - Touch-optimized sizing */}
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // Validate before testing
                if (errors?.apiKey || errors?.baseUrl) {
                  return;
                }
                onTest();
              }}
              className="w-20 h-9 sm:w-[80px] sm:h-10 text-xs sm:text-sm min-h-[var(--dt-touch-min-mobile)] sm:min-h-[var(--dt-touch-min-desktop)]"
              disabled={!!errors?.apiKey || !!errors?.baseUrl || isValidating}
              aria-describedby={`${provider.id}-test-description`}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  {isCompactViewport ? "Testing" : "Validating"}
                </>
              ) : (
                "Test"
              )}
            </Button>
            <div id={`${provider.id}-test-description`} className="sr-only">
              Test connection to {provider.name} API
            </div>
          </div>

          {/* Collapsible Section Mobile Behavior */}
          <Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 h-auto font-normal text-sm hover:bg-transparent",
                  // Touch-friendly sizing on mobile
                  "p-2 sm:p-1 min-h-[var(--dt-touch-min-mobile)] sm:min-h-auto",
                )}
                aria-expanded={showAdvanced}
                aria-controls={`${provider.id}-advanced-settings`}
              >
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="text-sm sm:text-base">
                  Base URL (Advanced)
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent
              id={`${provider.id}-advanced-settings`}
              className="space-y-2 pt-3 sm:pt-2"
            >
              <label
                htmlFor={`${provider.id}-base-url`}
                className="text-sm font-medium"
              >
                Base URL
              </label>
              <Input
                id={`${provider.id}-base-url`}
                type="url"
                value={baseUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onBaseUrlChange(e.target.value)
                }
                placeholder={provider.defaultBaseUrl}
                className={cn(
                  "text-base sm:text-sm",
                  errors?.baseUrl &&
                    "border-red-500 focus:border-red-500 focus:ring-red-200",
                )}
                // Mobile-specific attributes
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                aria-invalid={!!errors?.baseUrl}
                aria-describedby={
                  errors?.baseUrl
                    ? `${provider.id}-base-url-error ${provider.id}-base-url-description`
                    : `${provider.id}-base-url-description`
                }
              />
              {/* Error Message Responsive Display */}
              {errors?.baseUrl && (
                <p
                  id={`${provider.id}-base-url-error`}
                  className="text-xs sm:text-sm text-red-600 flex items-center gap-1 break-words"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {errors.baseUrl}
                </p>
              )}
              <div
                id={`${provider.id}-base-url-description`}
                className="text-xs text-muted-foreground"
              >
                The base URL for API requests. Must use HTTPS for security.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
