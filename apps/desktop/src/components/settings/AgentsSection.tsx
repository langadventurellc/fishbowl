/**
 * AgentsSection component provides agent management functionality with tab navigation.
 *
 * Features:
 * - Three-tab navigation: Library, Templates, Defaults
 * - Integration with TabContainer for consistent tab behavior
 * - Settings modal navigation state integration
 * - Responsive design and accessibility compliance
 * - 200ms animation transitions for smooth UX
 *
 * @module components/settings/AgentsSection
 */

import {
  useAgentSearch,
  type AgentCard as AgentCardType,
  type AgentDefaults,
  type AgentsSectionProps,
  type AgentTemplate,
  type TabConfiguration,
} from "@fishbowl-ai/shared";
import { Loader2, Plus, Search, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/utils";
import { announceToScreenReader } from "../../utils/announceToScreenReader";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { TabContainer } from "./TabContainer";
import {
  AgentCard,
  EmptyLibraryState,
  EmptyTemplatesState,
  TemplateCard,
} from "./agents";

// Mock agent data for demonstration
const mockAgents: AgentCardType[] = [
  {
    id: "1",
    name: "Research Assistant",
    model: "Claude 3.5 Sonnet",
    role: "Research and Analysis",
  },
  {
    id: "2",
    name: "Code Reviewer",
    model: "GPT-4",
    role: "Code Analysis",
  },
  {
    id: "3",
    name: "Creative Writer",
    model: "Claude 3.5 Sonnet",
    role: "Content Creation",
  },
  {
    id: "4",
    name: "Data Analyst",
    model: "GPT-4",
    role: "Data Analysis",
  },
  {
    id: "5",
    name: "Project Manager",
    model: "Claude 3.5 Sonnet",
    role: "Project Coordination",
  },
  {
    id: "6",
    name: "UX Designer",
    model: "GPT-4",
    role: "User Experience Design",
  },
  {
    id: "7",
    name: "Technical Writer",
    model: "Claude 3.5 Sonnet",
    role: "Documentation",
  },
  {
    id: "8",
    name: "Marketing Strategist",
    model: "GPT-4",
    role: "Marketing and Strategy",
  },
];

/**
 * Responsive grid layout for agent cards.
 */
const AgentGrid: React.FC<{ agents: AgentCardType[] }> = ({ agents }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
    {agents.map((agent) => (
      <AgentCard
        key={agent.id}
        agent={agent}
        onEdit={(agentId) => {
          // TODO: Implement edit functionality
          console.log("Edit agent:", agentId);
        }}
        onDelete={(agentId) => {
          // TODO: Implement delete functionality
          console.log("Delete agent:", agentId);
        }}
      />
    ))}
  </div>
);

/**
 * Library tab component with search functionality and agent cards display.
 */
const LibraryTab: React.FC = () => {
  const [agents] = useState<AgentCardType[]>(mockAgents);

  const {
    searchTerm,
    setSearchTerm,
    filteredAgents,
    isSearching,
    resultsCount,
    clearSearch,
    handleKeyDown,
  } = useAgentSearch({
    agents,
    announceToScreenReader,
  });

  return (
    <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
      {/* Search Bar with Enhanced UI */}
      <div className="space-y-2">
        <div className="relative max-w-md lg:max-w-lg xl:max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
            aria-label="Search agents by name, model, or role"
            aria-describedby={searchTerm ? "search-results-count" : undefined}
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Loading Indicator */}
          {isSearching && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Results Count */}
        {searchTerm && !isSearching && (
          <p
            id="search-results-count"
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {resultsCount === 0
              ? `No agents found for "${searchTerm}"`
              : `${resultsCount} agent${resultsCount === 1 ? "" : "s"} found`}
          </p>
        )}
      </div>

      {/* Content with Enhanced Empty States */}
      {filteredAgents.length === 0 ? (
        searchTerm ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No agents found for "{searchTerm}"
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Try adjusting your search terms or browse all agents.
            </p>
            <Button variant="outline" onClick={clearSearch}>
              Clear Search
            </Button>
          </div>
        ) : (
          <EmptyLibraryState
            onAction={() => {
              // TODO: Implement create agent functionality
              console.log("Create new agent");
            }}
          />
        )
      ) : (
        <AgentGrid agents={filteredAgents} />
      )}

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Agent
        </Button>
      </div>
    </div>
  );
};

// Mock template data with 8 realistic templates across categories
const mockTemplates: AgentTemplate[] = [
  {
    id: "template-research-assistant",
    name: "Research Assistant",
    description:
      "Specialized in gathering information, analyzing sources, and providing comprehensive research summaries with proper citations.",
    icon: "BookOpen",
    configuration: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      model: "Claude 3.5 Sonnet",
      systemPrompt: "You are a meticulous research assistant...",
    },
  },
  {
    id: "template-code-reviewer",
    name: "Code Reviewer",
    description:
      "Expert at analyzing code quality, suggesting improvements, and identifying potential security vulnerabilities.",
    icon: "Code",
    configuration: {
      temperature: 0.3,
      maxTokens: 1500,
      topP: 0.8,
      model: "GPT-4",
      systemPrompt: "You are a senior code reviewer...",
    },
  },
  {
    id: "template-content-creator",
    name: "Content Creator",
    description:
      "Creative writing specialist for marketing copy, blog posts, and engaging social media content.",
    icon: "PenTool",
    configuration: {
      temperature: 0.9,
      maxTokens: 1800,
      topP: 0.95,
      model: "Claude 3.5 Sonnet",
      systemPrompt: "You are a creative content writer...",
    },
  },
  {
    id: "template-data-analyst",
    name: "Data Analyst",
    description:
      "Processes datasets, creates visualizations, and provides statistical insights with clear explanations.",
    icon: "BarChart3",
    configuration: {
      temperature: 0.4,
      maxTokens: 2000,
      topP: 0.85,
      model: "GPT-4",
      systemPrompt: "You are an experienced data analyst...",
    },
  },
  {
    id: "template-project-manager",
    name: "Project Manager",
    description:
      "Coordinates tasks, manages timelines, and facilitates communication between team members effectively.",
    icon: "Calendar",
    configuration: {
      temperature: 0.6,
      maxTokens: 1600,
      topP: 0.9,
      model: "Claude 3.5 Sonnet",
      systemPrompt: "You are a professional project manager...",
    },
  },
  {
    id: "template-ux-consultant",
    name: "UX Consultant",
    description:
      "Evaluates user interfaces, suggests improvements, and provides user experience best practices.",
    icon: "Palette",
    configuration: {
      temperature: 0.7,
      maxTokens: 1700,
      topP: 0.9,
      model: "GPT-4",
      systemPrompt: "You are a senior UX consultant...",
    },
  },
  {
    id: "template-technical-writer",
    name: "Technical Writer",
    description:
      "Creates clear documentation, API guides, and user manuals with proper structure and examples.",
    icon: "FileText",
    configuration: {
      temperature: 0.5,
      maxTokens: 2200,
      topP: 0.85,
      model: "Claude 3.5 Sonnet",
      systemPrompt: "You are a technical writing specialist...",
    },
  },
  {
    id: "template-business-strategist",
    name: "Business Strategist",
    description:
      "Analyzes market trends, develops strategic plans, and provides actionable business recommendations.",
    icon: "TrendingUp",
    configuration: {
      temperature: 0.8,
      maxTokens: 1900,
      topP: 0.9,
      model: "GPT-4",
      systemPrompt: "You are a business strategy consultant...",
    },
  },
];

/**
 * Templates tab component with pre-configured template cards in responsive grid layout.
 */
const TemplatesTab: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
      {/* Header Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Agent Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose from pre-configured templates to quickly create specialized
          agents.
        </p>
      </div>

      {/* Templates Grid */}
      {mockTemplates.length === 0 ? (
        <EmptyTemplatesState
          onAction={() => {
            // TODO: Implement browse templates functionality
            console.log("Browse templates");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {mockTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={(templateId) => {
                // UI-only implementation - button styled and interactive but non-functional
                console.log("Use template:", templateId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Defaults tab component with configuration sliders and inputs.
 */
const DefaultsTab: React.FC = () => {
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="temperature-slider"
                    className="text-sm font-medium cursor-help"
                  >
                    Temperature
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Controls randomness in responses. Lower values (0.1-0.3) are
                    more focused and deterministic, higher values (1.5-2.0) are
                    more creative and varied.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                className="text-sm font-mono font-semibold text-primary"
                aria-live="polite"
              >
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature-slider"
              value={[settings.temperature]}
              onValueChange={handleTemperatureChange}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
              aria-label="Temperature: Controls randomness in responses"
            />
          </div>

          {/* Max Tokens Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="max-tokens-input"
                    className="text-sm font-medium cursor-help"
                  >
                    Max Tokens
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
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
            />
          </div>

          {/* Top P Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="top-p-slider"
                    className="text-sm font-medium cursor-help"
                  >
                    Top P
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Controls diversity by limiting token selection. Lower values
                    focus on likely tokens, higher values allow more variety.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span
                className="text-sm font-mono font-semibold text-primary"
                aria-live="polite"
              >
                {settings.topP.toFixed(2)}
              </span>
            </div>
            <Slider
              id="top-p-slider"
              value={[settings.topP]}
              onValueChange={handleTopPChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
              aria-label="Top P: Controls diversity by limiting token selection"
            />
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

export const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  // Tab configuration following established patterns
  const tabs: TabConfiguration[] = [
    {
      id: "library",
      label: "Library",
      content: () => <LibraryTab />,
    },
    {
      id: "templates",
      label: "Templates",
      content: () => <TemplatesTab />,
    },
    {
      id: "defaults",
      label: "Defaults",
      content: () => <DefaultsTab />,
    },
  ];

  return (
    <div className={cn("agents-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Agents</h1>
        <p className="text-muted-foreground mb-6">
          Configure AI agents and their behavior settings.
        </p>
      </div>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="agents-tabs"
      />
    </div>
  );
};
