import { isScrolledToBottom } from "../isScrolledToBottom";

describe("isScrolledToBottom", () => {
  let mockElement: HTMLElement;

  const createMockElement = (
    scrollHeight: number,
    scrollTop: number,
    clientHeight: number,
  ): HTMLElement => {
    const element = {} as HTMLElement;
    Object.defineProperty(element, "scrollHeight", {
      value: scrollHeight,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(element, "scrollTop", {
      value: scrollTop,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(element, "clientHeight", {
      value: clientHeight,
      writable: true,
      configurable: true,
    });
    return element;
  };

  beforeEach(() => {
    mockElement = createMockElement(1000, 0, 400);
  });

  describe("with default threshold (100px)", () => {
    it("returns true when scrolled to exact bottom", () => {
      // scrollTop + clientHeight = scrollHeight (exactly at bottom)
      mockElement.scrollTop = 600; // 600 + 400 = 1000

      expect(isScrolledToBottom(mockElement)).toBe(true);
    });

    it("returns true when within 100px of bottom", () => {
      // 50px from bottom (within 100px threshold)
      mockElement.scrollTop = 550; // remaining: 1000 - 550 - 400 = 50px

      expect(isScrolledToBottom(mockElement)).toBe(true);
    });

    it("returns true when exactly at 100px threshold", () => {
      // Exactly 100px from bottom
      mockElement.scrollTop = 500; // remaining: 1000 - 500 - 400 = 100px

      expect(isScrolledToBottom(mockElement)).toBe(true);
    });

    it("returns false when more than 100px from bottom", () => {
      // 150px from bottom (beyond 100px threshold)
      mockElement.scrollTop = 450; // remaining: 1000 - 450 - 400 = 150px

      expect(isScrolledToBottom(mockElement)).toBe(false);
    });

    it("returns false when at top", () => {
      mockElement.scrollTop = 0; // remaining: 1000 - 0 - 400 = 600px

      expect(isScrolledToBottom(mockElement)).toBe(false);
    });
  });

  describe("with custom threshold", () => {
    it("returns true when within custom threshold", () => {
      // 150px from bottom, using 200px threshold
      mockElement.scrollTop = 450; // remaining: 1000 - 450 - 400 = 150px

      expect(isScrolledToBottom(mockElement, 200)).toBe(true);
    });

    it("returns false when beyond custom threshold", () => {
      // 150px from bottom, using 100px threshold
      mockElement.scrollTop = 450; // remaining: 1000 - 450 - 400 = 150px

      expect(isScrolledToBottom(mockElement, 100)).toBe(false);
    });

    it("works with 0 threshold (exact bottom only)", () => {
      mockElement.scrollTop = 599; // remaining: 1000 - 599 - 400 = 1px
      expect(isScrolledToBottom(mockElement, 0)).toBe(false);

      mockElement.scrollTop = 600; // remaining: 1000 - 600 - 400 = 0px
      expect(isScrolledToBottom(mockElement, 0)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles element with no scroll (scrollHeight equals clientHeight)", () => {
      const element = createMockElement(400, 0, 400); // remaining: 400 - 0 - 400 = 0px

      expect(isScrolledToBottom(element)).toBe(true);
    });

    it("handles small content (scrollHeight less than clientHeight)", () => {
      const element = createMockElement(300, 0, 400); // remaining: 300 - 0 - 400 = -100px

      expect(isScrolledToBottom(element)).toBe(true);
    });

    it("handles zero height element", () => {
      const element = createMockElement(0, 0, 0);

      expect(isScrolledToBottom(element)).toBe(true);
    });

    it("handles large threshold values", () => {
      const element = createMockElement(1000, 0, 400); // remaining: 1000 - 0 - 400 = 600px

      expect(isScrolledToBottom(element, 1000)).toBe(true);
    });
  });
});
