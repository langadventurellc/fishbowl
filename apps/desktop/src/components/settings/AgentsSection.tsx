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

import React, { useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import { TabContainer } from "./TabContainer";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Search,
  Plus,
  Edit,
  Trash2,
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
import type {
  AgentsSectionProps,
  TabConfiguration,
  AgentCard,
} from "@fishbowl-ai/shared";

// Mock agent data for demonstration
const mockAgents: AgentCard[] = [
  {
    id: "1",
    name: "Research Assistant",
    model: "Claude 3.5 Sonnet",
    role: "Research and Analysis",
    icon: "BookOpen",
  },
  {
    id: "2",
    name: "Code Reviewer",
    model: "GPT-4",
    role: "Code Analysis",
    icon: "Code",
  },
  {
    id: "3",
    name: "Creative Writer",
    model: "Claude 3.5 Sonnet",
    role: "Content Creation",
    icon: "PenTool",
  },
  {
    id: "4",
    name: "Data Analyst",
    model: "GPT-4",
    role: "Data Analysis",
    icon: "BarChart3",
  },
  {
    id: "5",
    name: "Project Manager",
    model: "Claude 3.5 Sonnet",
    role: "Project Coordination",
    icon: "Calendar",
  },
  {
    id: "6",
    name: "UX Designer",
    model: "GPT-4",
    role: "User Experience Design",
    icon: "Palette",
  },
  {
    id: "7",
    name: "Technical Writer",
    model: "Claude 3.5 Sonnet",
    role: "Documentation",
    icon: "FileText",
  },
  {
    id: "8",
    name: "Marketing Strategist",
    model: "GPT-4",
    role: "Marketing and Strategy",
    icon: "TrendingUp",
  },
];

// Icon mapping for agent cards
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

/**
 * Individual agent card component with hover states and action buttons.
 */
interface AgentCardComponentProps {
  agent: AgentCard;
}

const AgentCardComponent: React.FC<AgentCardComponentProps> = ({ agent }) => {
  const IconComponent = iconMap[agent.icon] || BookOpen;

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.model}</p>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={`Edit ${agent.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={`Delete ${agent.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{agent.role}</p>
      </CardContent>
    </Card>
  );
};

/**
 * Responsive grid layout for agent cards.
 */
const AgentGrid: React.FC<{ agents: AgentCard[] }> = ({ agents }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {agents.map((agent) => (
      <AgentCardComponent key={agent.id} agent={agent} />
    ))}
  </div>
);

/**
 * Empty state component with conditional messaging.
 */
const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
      <Users className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">
      {query ? `No agents found for "${query}"` : "No agents configured"}
    </h3>
    <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
      {query
        ? "Try adjusting your search terms or browse all agents."
        : "Create your first agent to get started!"}
    </p>
  </div>
);

/**
 * Library tab component with search functionality and agent cards display.
 */
const LibraryTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents] = useState<AgentCard[]>(mockAgents);

  // Debounced search for performance
  const debouncedSearch = useDebounce(() => {
    // Search logic is handled by filteredAgents useMemo
  }, 300);

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.model.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query),
    );
  }, [agents, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedSearch();
          }}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {filteredAgents.length === 0 ? (
        <EmptyState query={searchQuery} />
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

/**
 * Templates tab placeholder component for agent template management.
 */
const TemplatesTab: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Agent Templates</h3>
      <p className="text-muted-foreground">
        Create and manage pre-configured agent templates.
      </p>
    </div>
  </div>
);

/**
 * Defaults tab placeholder component for agent default settings.
 */
const DefaultsTab: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Agent Defaults</h3>
      <p className="text-muted-foreground">
        Configure default settings for new agents.
      </p>
    </div>
  </div>
);

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
    <div className={cn("agents-section", className)}>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="agents-tabs"
      />
    </div>
  );
};
