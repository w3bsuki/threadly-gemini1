import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/helpers/index.ts', 'src/mocks/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'vitest'],
});