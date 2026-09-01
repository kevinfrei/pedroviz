// build.ts
import { $ } from 'bun';
import esbuild from 'esbuild';

try {
  await $`rm dist/*`;
} catch {}

await esbuild.build({
  entryPoints: ['./src/entry.ts'],
  outdir: './dist',
  bundle: true,
  sourcemap: false,
  minify: true,
  format: 'cjs',
  platform: 'node',
});

await $`cp src/static/* dist/`;

await esbuild.build({
  entryPoints: ['./src/client/frontend.tsx'],
  outdir: './dist',
  bundle: true,
  sourcemap: true,
  minify: true,
  format: 'cjs',
  jsx: 'automatic',
  jsxDev: false,
  define: {
    'process.env.NODE_ENV': '"production"', // Strips out React dev-mode code
  },
  platform: 'browser',
});
