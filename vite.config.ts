/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publica la versión web de prueba en https://mikeljka.github.io/IdleScrapyard/
export default defineConfig({
  base: '/IdleScrapyard/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
