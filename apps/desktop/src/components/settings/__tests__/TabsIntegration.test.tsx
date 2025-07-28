/**
 * Integration tests for Tabs component in settings context.
 *
 * @module components/settings/__tests__/TabsIntegration.test
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../index";

// Mock shared package to avoid dependency issues
jest.mock("@fishbowl-ai/shared", () => ({
  useActiveSubTab: () => "library",
  useSettingsActions: () => ({
    setActiveSubTab: jest.fn(),
  }),
}));

describe("Tabs Integration with Settings", () => {
  test("can be imported from settings module", () => {
    // Test passes if imports work without errors
    expect(Tabs).toBeDefined();
    expect(TabsList).toBeDefined();
    expect(TabsTrigger).toBeDefined();
    expect(TabsContent).toBeDefined();
  });

  test("integrates with claymorphism theme classes", () => {
    render(
      <Tabs defaultValue="library" data-testid="settings-tabs">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="library">Library Content</TabsContent>
        <TabsContent value="templates">Templates Content</TabsContent>
      </Tabs>,
    );

    const tabsList = screen.getByTestId("tabs-list");
    expect(tabsList).toHaveClass("bg-muted", "text-muted-foreground");

    const settingsTabs = screen.getByTestId("settings-tabs");
    expect(settingsTabs).toHaveClass("flex", "flex-col", "gap-2");
  });

  test("renders with agent section tab structure", () => {
    render(
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <div>Agent Library Content</div>
        </TabsContent>
        <TabsContent value="templates">
          <div>Agent Templates Content</div>
        </TabsContent>
        <TabsContent value="defaults">
          <div>Agent Defaults Content</div>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("Defaults")).toBeInTheDocument();
    expect(screen.getByText("Agent Library Content")).toBeVisible();
  });

  test("renders with personalities section tab structure", () => {
    render(
      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="create-new">Create New</TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <div>Saved Personalities Content</div>
        </TabsContent>
        <TabsContent value="create-new">
          <div>Create New Personality Content</div>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Create New")).toBeInTheDocument();
    expect(screen.getByText("Saved Personalities Content")).toBeVisible();
  });

  test("renders with roles section tab structure", () => {
    render(
      <Tabs defaultValue="predefined">
        <TabsList>
          <TabsTrigger value="predefined">Predefined</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="predefined">
          <div>Predefined Roles Content</div>
        </TabsContent>
        <TabsContent value="custom">
          <div>Custom Roles Content</div>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Predefined")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("Predefined Roles Content")).toBeVisible();
  });

  test("supports focus management for accessibility", () => {
    render(
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="library">Library Content</TabsContent>
        <TabsContent value="templates">Templates Content</TabsContent>
      </Tabs>,
    );

    const libraryTab = screen.getByText("Library");
    expect(libraryTab).toHaveAttribute("role", "tab");
    expect(libraryTab).toHaveAttribute("aria-selected", "true");

    const templatesTab = screen.getByText("Templates");
    expect(templatesTab).toHaveAttribute("role", "tab");
    expect(templatesTab).toHaveAttribute("aria-selected", "false");
  });

  test("maintains consistent styling patterns", () => {
    render(
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>
        <TabsContent value="library">Library Content</TabsContent>
      </Tabs>,
    );

    const trigger = screen.getByText("Library");
    expect(trigger).toHaveClass("text-foreground");
    expect(trigger).toHaveClass("inline-flex");
    expect(trigger).toHaveClass("items-center");
    expect(trigger).toHaveClass("justify-center");
  });
});
