const { device } = require("detox");

beforeAll(async () => {
  await device.launchApp();
}, 300000);

beforeEach(async () => {
  // Temporarily commented out due to Expo compatibility issues
  // await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});
