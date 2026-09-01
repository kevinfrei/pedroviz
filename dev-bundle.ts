// build.ts
import { $ } from 'bun';
import esbuild from 'esbuild';

try {
  await $`rm dist/*`;
} catch {}

await esbuild.build({
  entryPoints: ['./src/entry.ts'],
  outdir: './dev',
  bundle: true,
  sourcemap: true,
  minify: false,
  format: 'cjs',
  platform: 'node',
});

await $`cp src/static/* dev/`;

await (
  await esbuild.context({
    entryPoints: ['./src/client/frontend.tsx'],
    outdir: './dev',
    bundle: true,
    sourcemap: true,
    minify: false,
    format: 'cjs',
    jsx: 'automatic',
    jsxDev: true,
    platform: 'browser',
  })
).watch();

console.log('Watching front end changes...');
