import React from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import {
  Eye,
  EyeOff,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    defaultBaseUrl: string;
  };
  apiKey: string;
  baseUrl: string;
  status: "connected" | "error" | "untested";
  showApiKey: boolean;
  showAdvanced: boolean;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onToggleApiKey: () => void;
  onToggleAdvanced: () => void;
  onTest: () => void;
  errors?: {
    apiKey?: string;
    baseUrl?: string;
  };
  isValidating?: boolean;
}

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
  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Check className="h-4 w-4 text-green-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      case "untested":
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return <span className="text-green-600">Connected</span>;
      case "error":
        return <span className="text-red-600">Not connected</span>;
      case "untested":
      default:
        return <span className="text-gray-400">Not connected</span>;
    }
  };

  return (
    <Card className="border border-border rounded-lg">
      <CardHeader className="pb-4">
        <h3 className="text-lg font-semibold">{provider.name}</h3>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* API Key Input Section */}
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
              placeholder={`Enter your ${provider.name} API key`}
              className={cn(
                "pr-10",
                errors?.apiKey &&
                  "border-red-500 focus:border-red-500 focus:ring-red-200",
              )}
              aria-invalid={!!errors?.apiKey}
              aria-describedby={
                errors?.apiKey
                  ? `${provider.id}-api-key-error ${provider.id}-api-key-description`
                  : `${provider.id}-api-key-description`
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={onToggleApiKey}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors?.apiKey && (
            <p
              id={`${provider.id}-api-key-error`}
              className="text-sm text-red-600 flex items-center gap-1"
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

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </div>

        {/* Test Button */}
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
            className="w-20"
            disabled={!!errors?.apiKey || !!errors?.baseUrl || isValidating}
            aria-describedby={`${provider.id}-test-description`}
          >
            {isValidating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Validating
              </>
            ) : (
              "Test"
            )}
          </Button>
          <div id={`${provider.id}-test-description`} className="sr-only">
            Test connection to {provider.name} API
          </div>
        </div>

        {/* Collapsible Base URL Section */}
        <Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto font-normal text-sm hover:bg-transparent"
              aria-expanded={showAdvanced}
              aria-controls={`${provider.id}-advanced-settings`}
            >
              {showAdvanced ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Advanced
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            id={`${provider.id}-advanced-settings`}
            className="space-y-2 pt-2"
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
                errors?.baseUrl &&
                  "border-red-500 focus:border-red-500 focus:ring-red-200",
              )}
              aria-invalid={!!errors?.baseUrl}
              aria-describedby={
                errors?.baseUrl
                  ? `${provider.id}-base-url-error ${provider.id}-base-url-description`
                  : `${provider.id}-base-url-description`
              }
            />
            {errors?.baseUrl && (
              <p
                id={`${provider.id}-base-url-error`}
                className="text-sm text-red-600 flex items-center gap-1"
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
      </CardContent>
    </Card>
  );
}
