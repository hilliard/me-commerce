import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
});
