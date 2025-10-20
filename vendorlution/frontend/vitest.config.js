import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.js'],
    css: true,
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    include: ['src/**/*.test.{js,jsx,ts,tsx}']
  }
})