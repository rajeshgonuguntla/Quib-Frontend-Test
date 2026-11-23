import { defineConfig, devices } from '@playwright/test';

const refMode = Boolean(process.env.STUDIO_REF_DIR);

/** This repo's Vite server is pinned to 3000 in vite.config.ts. */
const baseURL = 'http://localhost:3000';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  use: {
    baseURL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  ...(refMode
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: baseURL,
          reuseExistingServer: true,
          env: {
            VITE_STUDIO_API_MODE: 'mock',
            BROWSER: 'none',
          },
        },
      }),
});
