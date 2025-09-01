/**
 * Application Menu Creator
 *
 * Creates platform-specific application menus for Electron with Settings menu item
 * and keyboard shortcuts. Handles macOS vs Windows/Linux menu differences.
 *
 * @module electron/createApplicationMenu
 */

import { Menu, MenuItemConstructorOptions, app } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { openSettingsModal } from "./main.js";
import { createNewConversation } from "./createNewConversation.js";

const logger = createLoggerSync({
  config: { name: "createApplicationMenu", level: "info" },
});

/**
 * Creates the application menu with platform-specific Settings placement
 * and keyboard shortcuts.
 *
 * @returns {Menu} The constructed application menu
 */
export function createApplicationMenu(): Menu {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    // macOS App Menu (first menu on macOS)
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              {
                label: "Settings...",
                accelerator: "Cmd+,",
                click: () => {
                  openSettingsModal();
                },
              },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),

    // File Menu
    {
      label: "File",
      submenu: [
        // Settings in File menu for Windows/Linux
        ...(!isMac
          ? [
              {
                label: "Settings...",
                accelerator: "Ctrl+,",
                click: () => {
                  openSettingsModal();
                },
              },
              { type: "separator" as const },
            ]
          : []),

        // Standard file operations
        {
          label: "New Conversation",
          accelerator: isMac ? "Cmd+N" : "Ctrl+N",
          click: () => {
            createNewConversation();
          },
        },
        { type: "separator" as const },

        // Exit for Windows/Linux (Quit is in App menu on macOS)
        ...(!isMac ? [{ role: "quit" as const }] : []),
      ],
    },

    // Edit Menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" as const },
        { role: "redo" as const },
        { type: "separator" as const },
        { role: "cut" as const },
        { role: "copy" as const },
        { role: "paste" as const },
        { role: "selectAll" as const },
      ],
    },

    // View Menu
    {
      label: "View",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { role: "toggleDevTools" as const },
        { type: "separator" as const },
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },

    // Window Menu
    {
      label: "Window",
      submenu: [
        { role: "minimize" as const },
        { role: "close" as const },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const },
            ]
          : []),
      ],
    },

    // Help Menu
    {
      label: "Help",
      submenu: [
        {
          label: "About Fishbowl",
          click: () => {
            // TODO: Implement about dialog
            logger.info("About dialog requested");
          },
        },
        {
          label: "Learn More",
          click: async () => {
            const { shell } = await import("electron");
            await shell.openExternal("https://fishbowl.ai");
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
