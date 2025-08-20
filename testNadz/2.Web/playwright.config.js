import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
});
