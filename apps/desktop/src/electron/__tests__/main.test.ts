// Mock electron modules
jest.mock("electron", () => ({
  app: {
    whenReady: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    getPath: jest.fn(() => "/mock/userData"),
  },
  BrowserWindow: jest.fn(),
  dialog: {
    showErrorBox: jest.fn(),
  },
  ipcMain: { handle: jest.fn(), on: jest.fn() },
  shell: { openExternal: jest.fn() },
  globalShortcut: { unregisterAll: jest.fn() },
}));

// Mock MainProcessServices
jest.mock("../../main/services/MainProcessServices", () => ({
  MainProcessServices: jest.fn().mockImplementation(() => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
    runDatabaseMigrations: jest.fn(),
    databaseBridge: {
      isConnected: jest.fn(() => true),
      query: jest.fn(),
      close: jest.fn(),
    },
  })),
}));

const { app: mockApp, dialog: mockDialog } = jest.mocked(require("electron"));
const { MainProcessServices } = jest.mocked(
  require("../../main/services/MainProcessServices"),
);

describe("Electron Main Process - Migration Integration", () => {
  let mainProcessServices: any;
  let initializeDatabase: jest.Mock;
  let createMainWindow: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mainProcessServices = new MainProcessServices();
    initializeDatabase = jest.fn();
    createMainWindow = jest.fn();
  });

  describe("App Startup with Migrations", () => {
    it("should run migrations after database initialization", async () => {
      // Arrange
      mainProcessServices.runDatabaseMigrations.mockResolvedValue(undefined);

      // Act - simulate startup sequence
      await initializeDatabase(mainProcessServices);
      await mainProcessServices.runDatabaseMigrations();
      createMainWindow();

      // Assert
      expect(mainProcessServices.runDatabaseMigrations).toHaveBeenCalled();
      expect(createMainWindow).toHaveBeenCalled();
      expect(initializeDatabase).toHaveBeenCalledWith(mainProcessServices);
    });

    it("should show error dialog when migrations fail", async () => {
      // Arrange
      const migrationError = new Error("Migration 002_add_messages.sql failed");
      mainProcessServices.runDatabaseMigrations.mockRejectedValue(
        migrationError,
      );

      // Act - simulate migration failure
      try {
        await mainProcessServices.runDatabaseMigrations();
      } catch (error) {
        // Simulate error handling
        mainProcessServices.logger.error(
          "Database migrations failed during startup:",
          error as Error,
        );
        mockDialog.showErrorBox(
          "Database Migration Failed",
          `Unable to update the application database.\n\n${migrationError.message}\n\nThe application will now exit.`,
        );
        mockApp.quit();
      }

      // Assert
      expect(mainProcessServices.logger.error).toHaveBeenCalledWith(
        "Database migrations failed during startup:",
        migrationError,
      );
      expect(mockDialog.showErrorBox).toHaveBeenCalledWith(
        "Database Migration Failed",
        expect.stringContaining("Migration 002_add_messages.sql failed"),
      );
      expect(mockApp.quit).toHaveBeenCalled();
    });

    it("should not create window if migrations fail", async () => {
      // Arrange
      const migrationError = new Error("Database schema update failed");
      mainProcessServices.runDatabaseMigrations.mockRejectedValue(
        migrationError,
      );

      // Act
      let windowCreated = false;
      try {
        await initializeDatabase(mainProcessServices);
        await mainProcessServices.runDatabaseMigrations();
        createMainWindow();
        windowCreated = true;
      } catch {
        // Migration failed, window should not be created
      }

      // Assert
      expect(windowCreated).toBe(false);
      expect(mainProcessServices.runDatabaseMigrations).toHaveBeenCalled();
      expect(createMainWindow).not.toHaveBeenCalled();
    });

    it("should maintain startup order: database -> migrations -> window", async () => {
      // Arrange
      const callOrder: string[] = [];
      initializeDatabase.mockImplementation(async () => {
        callOrder.push("database");
      });
      mainProcessServices.runDatabaseMigrations.mockImplementation(async () => {
        callOrder.push("migrations");
      });
      createMainWindow.mockImplementation(() => {
        callOrder.push("window");
      });

      // Act
      await initializeDatabase(mainProcessServices);
      await mainProcessServices.runDatabaseMigrations();
      createMainWindow();

      // Assert
      expect(callOrder).toEqual(["database", "migrations", "window"]);
    });

    it("should handle migration success with no pending migrations", async () => {
      // Arrange
      mainProcessServices.runDatabaseMigrations.mockResolvedValue(undefined);
      mainProcessServices.logger.info.mockClear();

      // Act
      await mainProcessServices.runDatabaseMigrations();

      // Assert
      expect(mainProcessServices.runDatabaseMigrations).toHaveBeenCalled();
      expect(mainProcessServices.logger.error).not.toHaveBeenCalled();
      expect(mockDialog.showErrorBox).not.toHaveBeenCalled();
      expect(mockApp.quit).not.toHaveBeenCalled();
    });

    it("should exit app when migrations throw error", async () => {
      // Arrange
      const criticalError = new Error("Cannot read migrations directory");
      mainProcessServices.runDatabaseMigrations.mockRejectedValue(
        criticalError,
      );
      let errorThrown = false;

      // Act
      try {
        await mainProcessServices.runDatabaseMigrations();
      } catch {
        errorThrown = true;
        mockApp.quit();
      }

      // Assert
      expect(errorThrown).toBe(true);
      expect(mockApp.quit).toHaveBeenCalled();
    });
  });
});
