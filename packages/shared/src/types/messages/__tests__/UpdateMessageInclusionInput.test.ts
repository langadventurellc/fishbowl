import { updateMessageInclusionInputSchema } from "../schemas/UpdateMessageInclusionInputSchema";

describe("UpdateMessageInclusionInputSchema validation", () => {
  const validInput = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    included: true,
  };

  it("should validate valid inclusion update input", () => {
    expect(() =>
      updateMessageInclusionInputSchema.parse(validInput),
    ).not.toThrow();
  });

  it("should validate input with included false", () => {
    const inputWithFalse = {
      ...validInput,
      included: false,
    };
    expect(() =>
      updateMessageInclusionInputSchema.parse(inputWithFalse),
    ).not.toThrow();
  });

  it("should reject invalid message ID format", () => {
    const invalidInput = { ...validInput, id: "not-a-uuid" };
    expect(() => updateMessageInclusionInputSchema.parse(invalidInput)).toThrow(
      "Invalid message ID format",
    );
  });

  it("should reject non-boolean included values", () => {
    const invalidInput = {
      ...validInput,
      included: "true" as unknown as boolean,
    };
    expect(() => updateMessageInclusionInputSchema.parse(invalidInput)).toThrow(
      "Included must be a boolean",
    );
  });

  it("should reject missing id field", () => {
    const invalidInput = { included: true };
    expect(() =>
      updateMessageInclusionInputSchema.parse(invalidInput),
    ).toThrow();
  });

  it("should reject missing included field", () => {
    const invalidInput = { id: "550e8400-e29b-41d4-a716-446655440000" };
    expect(() =>
      updateMessageInclusionInputSchema.parse(invalidInput),
    ).toThrow();
  });
});
