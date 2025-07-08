"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainWindow = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const utils_1 = require("@shared/utils");
const createMainWindow = async () => {
    // Create the browser window
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, '../preload/index.js')
        },
        show: false, // Don't show until ready-to-show
        titleBarStyle: 'default'
    });
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Focus on the window in development
        if (utils_1.isDev) {
            mainWindow.focus();
        }
    });
    return mainWindow;
};
exports.createMainWindow = createMainWindow;
