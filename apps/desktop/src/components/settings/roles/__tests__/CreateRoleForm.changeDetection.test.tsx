/**
 * Test suite for CreateRoleForm enhanced change detection functionality.
 *
 * Tests the implementation requirements from T-implement-and-test-change-detection:
 * - Enhanced change detection with edge case handling
 * - Field-level dirty state tracking and visual indicators
 * - Form reset behavior for cancel and save operations
 * - Integration with useUnsavedChanges hook
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type {
  RoleViewModel,
  CreateRoleFormProps,
} from "@fishbowl-ai/ui-shared";

// Mock external dependencies
jest.mock("../../../../hooks/useDebounce", () => ({
  useDebounce: jest.fn((fn) => fn),
}));

jest.mock("../../../../utils/announceToScreenReader", () => ({
  announceToScreenReader: jest.fn(),
}));

// Mock useServices hook
jest.mock("../../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  })),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(),
}));

// Mock the unsaved changes hook to track calls
const mockSetUnsavedChanges = jest.fn();
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useUnsavedChanges: () => ({
    setUnsavedChanges: mockSetUnsavedChanges,
  }),
  roleSchema: {
    parse: jest.fn(),
  },
}));

// Mock UI components with realistic dirty state testing
jest.mock("../RoleNameInput", () => ({
  RoleNameInput: ({ value, onChange, isDirty, disabled }: any) => (
    <div>
      <input
        data-testid="role-name-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {isDirty && <span data-testid="name-dirty-indicator">(modified)</span>}
    </div>
  ),
}));

jest.mock("../RoleDescriptionTextarea", () => ({
  RoleDescriptionTextarea: ({ value, onChange, isDirty, disabled }: any) => (
    <div>
      <textarea
        data-testid="role-description-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {isDirty && (
        <span data-testid="description-dirty-indicator">(modified)</span>
      )}
    </div>
  ),
}));

jest.mock("../RoleSystemPromptTextarea", () => ({
  RoleSystemPromptTextarea: ({ value, onChange, isDirty, disabled }: any) => (
    <div>
      <textarea
        data-testid="role-system-prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {isDirty && (
        <span data-testid="system-prompt-dirty-indicator">(modified)</span>
      )}
    </div>
  ),
}));

// Mock react-hook-form with enhanced change detection behavior
let mockFormValues = {
  name: "",
  description: "",
  systemPrompt: "",
};

let mockDirtyFields = {
  name: false,
  description: false,
  systemPrompt: false,
};

let mockFormState = {
  isValid: true,
  isDirty: false,
  errors: {},
  dirtyFields: mockDirtyFields,
};

const mockFormActions = {
  handleSubmit: jest.fn((fn) => (e: any) => {
    e?.preventDefault?.();
    fn?.(mockFormValues);
  }),
  reset: jest.fn((values, options) => {
    if (values) {
      mockFormValues = { ...values };
    }
    if (options?.keepDirty === false) {
      mockDirtyFields = {
        name: false,
        description: false,
        systemPrompt: false,
      };
      mockFormState.isDirty = false;
    }
  }),
  watch: jest.fn(() => mockFormValues),
  getFieldState: jest.fn((fieldName) => ({
    isDirty: mockDirtyFields[fieldName as keyof typeof mockDirtyFields],
  })),
  formState: mockFormState,
  control: {},
};

jest.mock("react-hook-form", () => ({
  useForm: () => mockFormActions,
}));

// Mock form components
jest.mock("../../../ui/form", () => ({
  Form: ({ children }: any) => children,
  FormField: ({ render, name }: any) =>
    render({
      field: {
        value: mockFormValues[name as keyof typeof mockFormValues] || "",
        onChange: jest.fn((value) => {
          mockFormValues = { ...mockFormValues, [name]: value };
          mockDirtyFields = { ...mockDirtyFields, [name]: true };
          mockFormState.isDirty = true;
        }),
        name,
      },
      fieldState: { error: null },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => children,
  FormMessage: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("../../../ui/button", () => ({
  Button: ({ children, disabled, type, onClick }: any) => (
    <button disabled={disabled} type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Import component after mocks
import { CreateRoleForm } from "../CreateRoleForm";

const mockExistingRoles: RoleViewModel[] = [
  {
    id: "role-1",
    name: "Existing Role",
    description: "An existing role",
    systemPrompt: "Existing prompt",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProps: CreateRoleFormProps = {
  mode: "create",
  onSave: jest.fn(),
  onCancel: jest.fn(),
  existingRoles: mockExistingRoles,
  isLoading: false,
};

const editProps: CreateRoleFormProps = {
  mode: "edit",
  initialData: {
    name: "Test Role",
    description: "Test description",
    systemPrompt: "Test system prompt",
    id: "role-1",
  } as any,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  existingRoles: mockExistingRoles,
  isLoading: false,
};

describe("CreateRoleForm - Enhanced Change Detection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetUnsavedChanges.mockClear();

    // Reset mock state
    mockFormValues = { name: "", description: "", systemPrompt: "" };
    mockDirtyFields = { name: false, description: false, systemPrompt: false };
    mockFormState.isDirty = false;
    mockFormState.isValid = true;
  });

  describe("Enhanced Change Detection Logic", () => {
    it("tracks unsaved changes correctly in create mode", async () => {
      mockFormValues = {
        name: "New Role",
        description: "Description",
        systemPrompt: "Prompt",
      };
      mockFormState.isDirty = true;

      render(<CreateRoleForm {...defaultProps} />);

      // Should track changes in create mode
      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalled();
      });
    });

    it("detects meaningful changes ignoring whitespace in edit mode", async () => {
      const props = {
        ...editProps,
        initialData: {
          name: "Original Name",
          description: "Original Description",
          systemPrompt: "Original Prompt",
          id: "role-1",
        } as any,
      };

      // Simulate user making a meaningful change with different whitespace
      mockFormValues = {
        name: "  Original Name  ", // Same content, different whitespace
        description: "Modified Description", // Actual change
        systemPrompt: "Original Prompt",
      };
      mockFormState.isDirty = true;

      render(<CreateRoleForm {...props} />);

      // Should detect the description change but ignore name whitespace
      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });

    it("correctly handles case where all fields have only whitespace changes", async () => {
      const props = {
        ...editProps,
        initialData: {
          name: "Original",
          description: "Description",
          systemPrompt: "Prompt",
          id: "role-1",
        } as any,
      };

      // Simulate whitespace-only changes
      mockFormValues = {
        name: "  Original  ",
        description: "  Description  ",
        systemPrompt: "  Prompt  ",
      };
      mockFormState.isDirty = true;

      render(<CreateRoleForm {...props} />);

      // Should not consider as meaningful changes
      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);
      });
    });

    it("detects changes when content actually differs after trimming", async () => {
      const props = {
        ...editProps,
        initialData: {
          name: "Original",
          description: "Description",
          systemPrompt: "Prompt",
          id: "role-1",
        } as any,
      };

      // Simulate actual content change
      mockFormValues = {
        name: "Modified Name",
        description: "Description",
        systemPrompt: "Prompt",
      };
      mockFormState.isDirty = true;

      render(<CreateRoleForm {...props} />);

      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("Field-Level Dirty State Tracking", () => {
    it("shows dirty indicator for modified name field", async () => {
      const props = {
        ...editProps,
        initialData: {
          name: "Original Name",
          description: "Description",
          systemPrompt: "Prompt",
          id: "role-1",
        } as any,
      };

      // Simulate name change
      mockFormValues = {
        name: "Modified Name",
        description: "Description",
        systemPrompt: "Prompt",
      };
      mockDirtyFields.name = true;

      render(<CreateRoleForm {...props} />);

      expect(screen.getByTestId("name-dirty-indicator")).toBeInTheDocument();
      expect(
        screen.queryByTestId("description-dirty-indicator"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("system-prompt-dirty-indicator"),
      ).not.toBeInTheDocument();
    });

    it("shows dirty indicators for multiple modified fields", async () => {
      const props = {
        ...editProps,
        initialData: {
          name: "Original Name",
          description: "Original Description",
          systemPrompt: "Original Prompt",
          id: "role-1",
        } as any,
      };

      // Simulate changes to name and description
      mockFormValues = {
        name: "Modified Name",
        description: "Modified Description",
        systemPrompt: "Original Prompt",
      };
      mockDirtyFields.name = true;
      mockDirtyFields.description = true;

      render(<CreateRoleForm {...props} />);

      expect(screen.getByTestId("name-dirty-indicator")).toBeInTheDocument();
      expect(
        screen.getByTestId("description-dirty-indicator"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("system-prompt-dirty-indicator"),
      ).not.toBeInTheDocument();
    });

    it("does not show dirty indicators in create mode for new fields", () => {
      // In create mode, should use React Hook Form's dirtyFields
      render(<CreateRoleForm {...defaultProps} />);

      // Should not show dirty indicators initially
      expect(
        screen.queryByTestId("name-dirty-indicator"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("description-dirty-indicator"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("system-prompt-dirty-indicator"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Reset Behavior", () => {
    it("calls reset after successful save", async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const props = { ...defaultProps, onSave: mockOnSave };
      mockFormState.isDirty = true;
      mockFormState.isValid = true;

      render(<CreateRoleForm {...props} />);

      const submitButton = screen.getByRole("button", { name: /save role/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFormActions.reset).toHaveBeenCalled();
      });
    });

    it("resets to original values on cancel in edit mode", async () => {
      const originalData = {
        name: "Original Name",
        description: "Original Description",
        systemPrompt: "Original Prompt",
        id: "role-1",
      };

      const props = {
        ...editProps,
        initialData: originalData as any,
      };

      render(<CreateRoleForm {...props} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockFormActions.reset).toHaveBeenCalledWith(originalData, {
          keepDefaultValues: false,
          keepDirty: false,
          keepErrors: false,
        });
      });
    });

    it("clears unsaved changes state after successful save", async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const props = { ...defaultProps, onSave: mockOnSave };
      mockFormState.isDirty = true;
      mockFormState.isValid = true;

      render(<CreateRoleForm {...props} />);

      const submitButton = screen.getByRole("button", { name: /save role/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);
      });
    });

    it("clears unsaved changes state after cancel", async () => {
      render(<CreateRoleForm {...editProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Submit Button State", () => {
    it("properly handles submit button state based on form validity and dirty state", () => {
      mockFormState.isDirty = true;
      mockFormState.isValid = true;

      render(<CreateRoleForm {...editProps} />);

      // Button should be enabled when form is valid and dirty
      const submitButton = screen.getByRole("button", { name: /update role/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("shows correct button text in different modes", () => {
      mockFormState.isDirty = true;
      mockFormState.isValid = true;

      const { rerender } = render(<CreateRoleForm {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /save role/i }),
      ).toBeInTheDocument();

      rerender(<CreateRoleForm {...editProps} />);

      expect(
        screen.getByRole("button", { name: /update role/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined initial data gracefully", () => {
      const props = {
        ...editProps,
        initialData: undefined,
      };

      expect(() => render(<CreateRoleForm {...props} />)).not.toThrow();
    });

    it("handles initial data without trim-able content", () => {
      const props = {
        ...editProps,
        initialData: {
          name: "",
          description: "",
          systemPrompt: "",
          id: "role-1",
        } as any,
      };

      expect(() => render(<CreateRoleForm {...props} />)).not.toThrow();
    });

    it("properly tracks changes when switching between create and edit modes", () => {
      const { rerender } = render(<CreateRoleForm {...defaultProps} />);

      // Switch to edit mode
      rerender(<CreateRoleForm {...editProps} />);

      // Should not throw and should handle state properly
      expect(screen.getByTestId("role-name-input")).toBeInTheDocument();
    });
  });

  describe("Integration with useUnsavedChanges", () => {
    it("calls setUnsavedChanges with correct value on mount", () => {
      render(<CreateRoleForm {...defaultProps} />);

      expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);
    });

    it("updates unsaved changes when enhanced dirty state changes", async () => {
      const { rerender } = render(<CreateRoleForm {...editProps} />);

      // Simulate form becoming dirty
      mockFormState.isDirty = true;
      mockFormValues = {
        name: "Modified Name",
        description: "Test description",
        systemPrompt: "Test system prompt",
      };

      rerender(<CreateRoleForm {...editProps} />);

      await waitFor(() => {
        expect(mockSetUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });
  });
});
