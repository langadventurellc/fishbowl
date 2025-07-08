'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupWindowEvents = exports.setupIpcHandlers = void 0;
var handlers_1 = require('./handlers');
Object.defineProperty(exports, 'setupIpcHandlers', {
  enumerable: true,
  get: function () {
    return handlers_1.setupIpcHandlers;
  },
});
var windowEvents_1 = require('./windowEvents');
Object.defineProperty(exports, 'setupWindowEvents', {
  enumerable: true,
  get: function () {
    return windowEvents_1.setupWindowEvents;
  },
});
