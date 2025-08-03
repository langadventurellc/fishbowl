import { applyTheme } from "../applyTheme";

describe("applyTheme", () => {
  let root: HTMLElement;
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    // Setup DOM
    root = document.documentElement;
    root.className = "";
    root.removeAttribute("data-theme");

    // Setup matchMedia mock with default behavior
    matchMediaMock = jest.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    // Cleanup
    root.className = "";
    root.removeAttribute("data-theme");
  });

  describe("light theme", () => {
    it("should apply light theme class", () => {
      applyTheme("light");

      expect(root.classList.contains("light")).toBe(true);
      expect(root.classList.contains("dark")).toBe(false);
    });

    it("should set data-theme attribute to light", () => {
      applyTheme("light");

      expect(root.getAttribute("data-theme")).toBe("light");
    });

    it("should remove existing theme classes before applying", () => {
      root.classList.add("dark");

      applyTheme("light");

      expect(root.classList.contains("light")).toBe(true);
      expect(root.classList.contains("dark")).toBe(false);
    });
  });

  describe("dark theme", () => {
    it("should apply dark theme class", () => {
      applyTheme("dark");

      expect(root.classList.contains("dark")).toBe(true);
      expect(root.classList.contains("light")).toBe(false);
    });

    it("should set data-theme attribute to dark", () => {
      applyTheme("dark");

      expect(root.getAttribute("data-theme")).toBe("dark");
    });

    it("should remove existing theme classes before applying", () => {
      root.classList.add("light");

      applyTheme("dark");

      expect(root.classList.contains("dark")).toBe(true);
      expect(root.classList.contains("light")).toBe(false);
    });
  });

  describe("system theme", () => {
    it("should apply dark theme when system prefers dark", () => {
      matchMediaMock.mockReturnValue({ matches: true });

      applyTheme("system");

      expect(root.classList.contains("dark")).toBe(true);
      expect(root.classList.contains("light")).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith(
        "(prefers-color-scheme: dark)",
      );
    });

    it("should apply light theme when system prefers light", () => {
      matchMediaMock.mockReturnValue({ matches: false });

      applyTheme("system");

      expect(root.classList.contains("light")).toBe(true);
      expect(root.classList.contains("dark")).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith(
        "(prefers-color-scheme: dark)",
      );
    });

    it("should set data-theme attribute to system", () => {
      matchMediaMock.mockReturnValue({ matches: false });

      applyTheme("system");

      expect(root.getAttribute("data-theme")).toBe("system");
    });

    it("should remove existing theme classes before applying system theme", () => {
      root.classList.add("light", "dark");
      matchMediaMock.mockReturnValue({ matches: true });

      applyTheme("system");

      expect(root.classList.contains("dark")).toBe(true);
      expect(root.classList.contains("light")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple rapid theme changes", () => {
      applyTheme("light");
      applyTheme("dark");
      applyTheme("system");
      matchMediaMock.mockReturnValue({ matches: false });
      applyTheme("light");

      expect(root.classList.contains("light")).toBe(true);
      expect(root.classList.contains("dark")).toBe(false);
      expect(root.getAttribute("data-theme")).toBe("light");
    });

    it("should work when classList has other non-theme classes", () => {
      root.classList.add("some-other-class", "another-class");

      applyTheme("dark");

      expect(root.classList.contains("dark")).toBe(true);
      expect(root.classList.contains("light")).toBe(false);
      expect(root.classList.contains("some-other-class")).toBe(true);
      expect(root.classList.contains("another-class")).toBe(true);
    });
  });
});
