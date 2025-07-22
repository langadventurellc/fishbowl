export const config = {
  runner: "local",
  specs: ["./features/**/*.spec.ts"],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: "chrome",
      "goog:chromeOptions": {
        binary: "../../apps/desktop/dist-electron/main.js",
        args: ["--no-sandbox", "--disable-web-security", "--headless"],
      },
    },
  ],
  logLevel: "warn",
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
};
