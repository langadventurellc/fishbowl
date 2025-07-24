describe("Mobile App Startup", () => {
  beforeEach(async () => {
    // Temporarily commented out due to Expo compatibility issues
    // await device.reloadReactNative();
  });

  describe("Scenario: App launches successfully", () => {
    it("should display Hello World on Dashboard", async () => {
      // Given - App is launched
      // When - User views the Dashboard screen
      await waitFor(element(by.id("Dashboard.container")))
        .toBeVisible()
        .withTimeout(10000);

      // Then - Hello World content is displayed
      await expect(element(by.id("Dashboard.title"))).toHaveText(
        "Hello from Fishbowl Mobile!",
      );
      await expect(element(by.id("Dashboard.subtitle"))).toHaveText(
        "Dashboard Screen",
      );
    });

    it("should display tab navigation", async () => {
      // Given - App is launched
      // When - User views the tab bar
      // Then - Both tabs should be visible (use more specific matchers)
      await expect(element(by.text("Dashboard")).atIndex(0)).toBeVisible();
      await expect(element(by.text("Settings")).atIndex(0)).toBeVisible();
    });
  });

  describe("Scenario: Navigate between tabs", () => {
    it("should navigate to Settings tab", async () => {
      // Given - User is on Dashboard
      await waitFor(element(by.id("Dashboard.container")))
        .toBeVisible()
        .withTimeout(10000);

      // When - User taps the Settings tab
      await element(by.text("Settings")).atIndex(0).tap();

      // Then - Settings screen is displayed
      await waitFor(element(by.id("Settings.container")))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id("Settings.title"))).toHaveText(
        "Hello from Fishbowl Mobile!",
      );
      await expect(element(by.id("Settings.subtitle"))).toHaveText(
        "Settings Screen",
      );
    });

    it("should navigate back to Dashboard tab", async () => {
      // Given - User is on Settings screen
      await element(by.text("Settings")).atIndex(0).tap();
      await waitFor(element(by.id("Settings.container")))
        .toBeVisible()
        .withTimeout(5000);

      // When - User taps the Dashboard tab
      await element(by.text("Dashboard")).atIndex(0).tap();

      // Then - Dashboard screen is displayed
      await waitFor(element(by.id("Dashboard.container")))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id("Dashboard.title"))).toHaveText(
        "Hello from Fishbowl Mobile!",
      );
      await expect(element(by.id("Dashboard.subtitle"))).toHaveText(
        "Dashboard Screen",
      );
    });
  });

  describe("Scenario: Basic app functionality", () => {
    it("should maintain state during tab switching", async () => {
      // Given - App is running
      await waitFor(element(by.id("Dashboard.container")))
        .toBeVisible()
        .withTimeout(10000);

      // When - User switches between tabs multiple times
      await element(by.text("Settings")).atIndex(0).tap();
      await waitFor(element(by.id("Settings.container"))).toBeVisible();

      await element(by.text("Dashboard")).atIndex(0).tap();
      await waitFor(element(by.id("Dashboard.container"))).toBeVisible();

      await element(by.text("Settings")).atIndex(0).tap();
      await waitFor(element(by.id("Settings.container"))).toBeVisible();

      // Then - App remains responsive and content is correct
      await expect(element(by.id("Settings.title"))).toHaveText(
        "Hello from Fishbowl Mobile!",
      );
      await expect(element(by.id("Settings.subtitle"))).toHaveText(
        "Settings Screen",
      );
    });
  });
});
