describe('Feature: Application Launch', () => {
  beforeAll(async () => {
    // Launch Tauri application
    await browser.url('tauri://localhost');
  });

  afterAll(async () => {
    // Cleanup
    await browser.deleteSession();
  });

  describe('Scenario: Desktop app starts successfully', () => {
    it('should launch without errors', async () => {
      // Given - Application is starting up
      
      // When - Application loads
      await browser.url('tauri://localhost');
      
      // Then - Application window is displayed and responsive
      await expect(browser).toHaveTitle('Fishbowl AI');
    });
  });
});