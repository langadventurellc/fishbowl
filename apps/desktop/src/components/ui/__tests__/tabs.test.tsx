/**
 * Unit tests for shadcn/ui Tabs component integration.
 *
 * @module components/ui/__tests__/tabs.test
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("shadcn/ui Tabs Component", () => {
  const TestTabs = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  );

  test("renders tabs without errors", () => {
    render(<TestTabs />);
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  test("shows correct content for active tab", () => {
    render(<TestTabs />);
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  test("renders with correct initial tab selection", () => {
    render(<TestTabs />);

    // Verify tab structure is correct
    const tab1 = screen.getByText("Tab 1");
    const tab2 = screen.getByText("Tab 2");

    expect(tab1).toHaveAttribute("data-state", "active");
    expect(tab2).toHaveAttribute("data-state", "inactive");
    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(tab2).toHaveAttribute("aria-selected", "false");

    // Content for active tab should be visible
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  test("has proper ARIA attributes", () => {
    render(<TestTabs />);
    const tab1 = screen.getByText("Tab 1");
    expect(tab1).toHaveAttribute("role", "tab");
    expect(tab1).toHaveAttribute("aria-selected", "true");
  });

  test("applies custom className to components", () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content 1
        </TabsContent>
      </Tabs>,
    );

    const tabs = screen.getByRole("tablist").parentElement;
    expect(tabs).toHaveClass("custom-tabs");

    const tabsList = screen.getByRole("tablist");
    expect(tabsList).toHaveClass("custom-list");

    const trigger = screen.getByText("Tab 1");
    expect(trigger).toHaveClass("custom-trigger");

    const content = screen.getByText("Content 1");
    expect(content).toHaveClass("custom-content");
  });

  test("supports disabled tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    const disabledTab = screen.getByText("Tab 2");
    expect(disabledTab).toBeDisabled();

    fireEvent.click(disabledTab);
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });
});
