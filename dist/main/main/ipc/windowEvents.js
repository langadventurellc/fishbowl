'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupWindowEvents = void 0;
/**
 * Set up window event listeners to emit to renderer
 */
const setupWindowEvents = window => {
  window.on('focus', () => {
    window.webContents.send('window:focus');
  });
  window.on('blur', () => {
    window.webContents.send('window:blur');
  });
  window.on('resize', () => {
    const [width, height] = window.getSize();
    window.webContents.send('window:resize', { width, height });
  });
};
exports.setupWindowEvents = setupWindowEvents;
