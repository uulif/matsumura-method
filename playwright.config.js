const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3003',
    headless: true,
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: 'npx serve -l 3003 --no-clipboard',
    port: 3003,
    reuseExistingServer: true,
  },
});
