import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { RolesList } from "../RolesList";
import type { RoleViewModel } from "@fishbowl-ai/ui-shared";

// Mock roles data for testing - matches expected structure and names from original tests
const mockRoles: RoleViewModel[] = [
  {
    id: "analyst",
    name: "Analyst",
    description: "Analytical thinker for data-driven insights",
    systemPrompt:
      "You are an analytical thinker focused on data-driven insights.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "business-strategist",
    name: "Business Strategist",
    description: "Strategic business advisor",
    systemPrompt: "You are a strategic business advisor.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "coach",
    name: "Coach",
    description: "Supportive coach and mentor",
    systemPrompt: "You are a supportive coach and mentor.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "creative-director",
    name: "Creative Director",
    description: "Creative visionary and director",
    systemPrompt: "You are a creative visionary and director.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "critic",
    name: "Critic",
    description: "Critical evaluator and reviewer",
    systemPrompt: "You are a critical evaluator and reviewer.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Financial planning and advisory expert",
    systemPrompt: "You are a financial planning and advisory expert.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "generalist",
    name: "Generalist",
    description: "Well-rounded generalist",
    systemPrompt: "You are a well-rounded generalist.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Organized project coordination expert",
    systemPrompt: "You are an organized project coordination expert.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Engaging storyteller and narrator",
    systemPrompt: "You are an engaging storyteller and narrator.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "technical-advisor",
    name: "Technical Advisor",
    description: "Technical expertise and guidance",
    systemPrompt: "You are a technical expertise and guidance provider.",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const defaultProps = {
  roles: mockRoles,
  onCreateRole: jest.fn(),
  onEditRole: jest.fn(),
  onDeleteRole: jest.fn(),
};

describe("RolesList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all sample roles", () => {
    render(<RolesList {...defaultProps} />);

    // Check that all 10 sample roles are rendered
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Technical Advisor")).toBeInTheDocument();
    expect(screen.getByText("Creative Director")).toBeInTheDocument();
    expect(screen.getByText("Storyteller")).toBeInTheDocument();
    expect(screen.getByText("Analyst")).toBeInTheDocument();
    expect(screen.getByText("Coach")).toBeInTheDocument();
    expect(screen.getByText("Critic")).toBeInTheDocument();
    expect(screen.getByText("Business Strategist")).toBeInTheDocument();
    expect(screen.getByText("Financial Advisor")).toBeInTheDocument();
    expect(screen.getByText("Generalist")).toBeInTheDocument();
  });

  it("sorts roles alphabetically by name", () => {
    render(<RolesList {...defaultProps} />);

    const roleNames = screen
      .getAllByRole("listitem")
      .map((item) => item.querySelector(".text-base")?.textContent)
      .filter(Boolean);

    const sortedNames = [...roleNames].sort((a, b) => a!.localeCompare(b!));

    expect(roleNames).toEqual(sortedNames);
  });

  it("renders exactly the correct number of roles", () => {
    render(<RolesList {...defaultProps} />);

    const roleItems = screen.getAllByRole("listitem");
    expect(roleItems).toHaveLength(mockRoles.length);
    expect(roleItems).toHaveLength(10);
  });

  it("renders Create Role button at bottom", () => {
    render(<RolesList {...defaultProps} />);

    const createButton = screen.getByLabelText("Create a new role");
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent("Create Role");
    expect(createButton).toHaveClass("w-full", "gap-2");
  });

  it("calls onCreateRole when Create button is clicked", () => {
    render(<RolesList {...defaultProps} />);

    const createButton = screen.getByLabelText("Create a new role");
    fireEvent.click(createButton);

    expect(defaultProps.onCreateRole).toHaveBeenCalledTimes(1);
  });

  it("passes edit and delete handlers to each role item", () => {
    render(<RolesList {...defaultProps} />);

    // Click edit on first role (alphabetically - should be "Analyst")
    const editButtons = screen.getAllByText("Edit");
    const firstEditButton = editButtons[0];
    expect(firstEditButton).toBeInTheDocument();
    fireEvent.click(firstEditButton!);

    expect(defaultProps.onEditRole).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Analyst" }),
    );
  });

  it("passes delete handler to role items", () => {
    render(<RolesList {...defaultProps} />);

    // Click delete on first role (alphabetically - should be "Analyst")
    const deleteButtons = screen.getAllByText("Delete");
    const firstDeleteButton = deleteButtons[0];
    expect(firstDeleteButton).toBeInTheDocument();
    fireEvent.click(firstDeleteButton!);

    expect(defaultProps.onDeleteRole).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Analyst" }),
    );
  });

  it("has proper accessibility attributes", () => {
    render(<RolesList {...defaultProps} />);

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "10 roles available");
    expect(list).toHaveAttribute("aria-describedby", "roles-list-description");

    const description = screen.getByText(/List of 10 available roles/);
    expect(description).toHaveClass("sr-only");
    expect(description).toHaveAttribute("id", "roles-list-description");
  });

  it("has accessible heading for screen readers", () => {
    render(<RolesList {...defaultProps} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("All Roles List");
    expect(heading).toHaveClass("sr-only");
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-roles-list";
    render(<RolesList {...defaultProps} className={customClass} />);

    const container = document.querySelector(".roles-list");
    expect(container).toHaveClass(customClass);
  });

  it("renders without optional handlers", () => {
    render(<RolesList roles={mockRoles} />);

    // Should render without errors
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByLabelText("Create a new role")).toBeInTheDocument();
  });

  it("handles click events without handlers gracefully", () => {
    render(<RolesList roles={mockRoles} />);

    const createButton = screen.getByLabelText("Create a new role");
    const editButtons = screen.getAllByText("Edit");
    const editButton = editButtons[0];

    // Should not throw errors when clicked
    expect(() => {
      fireEvent.click(createButton);
      fireEvent.click(editButton!);
    }).not.toThrow();
  });

  it("maintains proper layout structure", () => {
    render(<RolesList {...defaultProps} />);

    const container = document.querySelector(".roles-list");
    expect(container).toHaveClass("flex", "flex-col", "h-full");

    // Check scrollable area
    const scrollableArea = container?.querySelector(
      ".max-h-\\[var\\(--dt-scrollable-list-max-height\\)\\]",
    );
    expect(scrollableArea).toHaveClass("overflow-y-auto", "space-y-4");

    // Check create button container
    const createButtonContainer = container?.querySelector(".pt-6.border-t");
    expect(createButtonContainer).toBeInTheDocument();
  });

  it("includes Plus icon in Create button", () => {
    render(<RolesList {...defaultProps} />);

    const createButton = screen.getByLabelText("Create a new role");
    const icon = createButton.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-4", "w-4");
  });

  it("applies correct CSS variables for scrollable container", () => {
    render(<RolesList {...defaultProps} />);

    const scrollableContainer = document.querySelector(
      ".max-h-\\[var\\(--dt-scrollable-list-max-height\\)\\]",
    );
    expect(scrollableContainer).toHaveClass(
      "pr-[var(--dt-scrollable-container-padding-right)]",
    );
  });

  it("ensures first role alphabetically is Analyst", () => {
    render(<RolesList {...defaultProps} />);

    const roleItems = screen.getAllByRole("listitem");
    const firstRoleItem = roleItems[0];
    expect(firstRoleItem).toBeInTheDocument();
    const firstRoleName =
      firstRoleItem!.querySelector(".text-base")?.textContent;
    expect(firstRoleName).toBe("Analyst");
  });

  it("ensures last role alphabetically is Technical Advisor", () => {
    render(<RolesList {...defaultProps} />);

    const roleItems = screen.getAllByRole("listitem");
    const lastRoleItem = roleItems[roleItems.length - 1];
    expect(lastRoleItem).toBeInTheDocument();
    const lastRoleName = lastRoleItem!.querySelector(".text-base")?.textContent;
    expect(lastRoleName).toBe("Technical Advisor");
  });
});
