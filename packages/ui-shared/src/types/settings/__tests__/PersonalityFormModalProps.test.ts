import { PersonalityFormModalProps } from "../PersonalityFormModalProps";
import { PersonalityViewModel } from "../PersonalityViewModel";
import { PersonalityFormData } from "../PersonalityFormData";

describe("PersonalityFormModalProps", () => {
  describe("interface structure", () => {
    it("should correctly type all required properties", () => {
      const mockOnSave = jest.fn();
      const mockOnOpenChange = jest.fn();

      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        mode: "create",
        onSave: mockOnSave,
      };

      expect(typeof props.isOpen).toBe("boolean");
      expect(typeof props.onOpenChange).toBe("function");
      expect(props.mode).toBe("create");
      expect(typeof props.onSave).toBe("function");
    });

    it("should correctly type optional properties", () => {
      const mockOnSave = jest.fn();
      const mockOnOpenChange = jest.fn();
      const mockPersonality = {} as PersonalityViewModel;

      const props: PersonalityFormModalProps = {
        isOpen: false,
        onOpenChange: mockOnOpenChange,
        mode: "edit",
        personality: mockPersonality,
        onSave: mockOnSave,
        isLoading: true,
      };

      expect(typeof props.personality).toBe("object");
      expect(typeof props.isLoading).toBe("boolean");
    });

    it("should enforce mode literal types", () => {
      const mockOnSave = jest.fn();
      const mockOnOpenChange = jest.fn();

      const createModeProps: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        mode: "create",
        onSave: mockOnSave,
      };

      const editModeProps: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        mode: "edit",
        onSave: mockOnSave,
      };

      expect(createModeProps.mode).toBe("create");
      expect(editModeProps.mode).toBe("edit");
    });

    it("should accept PersonalityFormData in onSave callback", () => {
      const mockPersonalityFormData = {} as PersonalityFormData;

      const handleSave = (data: PersonalityFormData) => {
        expect(data).toBe(mockPersonalityFormData);
      };

      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: jest.fn(),
        mode: "create",
        onSave: handleSave,
      };

      props.onSave(mockPersonalityFormData);
    });

    it("should accept boolean parameter in onOpenChange callback", () => {
      const handleOpenChange = (open: boolean) => {
        expect(typeof open).toBe("boolean");
      };

      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: handleOpenChange,
        mode: "create",
        onSave: jest.fn(),
      };

      props.onOpenChange(false);
    });
  });

  describe("type imports", () => {
    it("should import PersonalityViewModel type correctly", () => {
      const mockPersonality = {} as PersonalityViewModel;

      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: jest.fn(),
        mode: "edit",
        personality: mockPersonality,
        onSave: jest.fn(),
      };

      expect(props.personality).toBe(mockPersonality);
    });

    it("should import PersonalityFormData type correctly", () => {
      const mockFormData = {} as PersonalityFormData;

      const handleSave = (data: PersonalityFormData) => {
        expect(data).toBe(mockFormData);
      };

      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: jest.fn(),
        mode: "create",
        onSave: handleSave,
      };

      props.onSave(mockFormData);
    });
  });

  describe("required vs optional properties", () => {
    it("should compile with only required properties", () => {
      const props: PersonalityFormModalProps = {
        isOpen: true,
        onOpenChange: jest.fn(),
        mode: "create",
        onSave: jest.fn(),
      };

      expect(props.personality).toBeUndefined();
      expect(props.isLoading).toBeUndefined();
    });

    it("should compile with all properties including optional ones", () => {
      const props: PersonalityFormModalProps = {
        isOpen: false,
        onOpenChange: jest.fn(),
        mode: "edit",
        personality: {} as PersonalityViewModel,
        onSave: jest.fn(),
        isLoading: false,
      };

      expect(props.personality).toBeDefined();
      expect(props.isLoading).toBeDefined();
    });
  });
});
