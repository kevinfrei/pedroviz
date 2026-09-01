import path from 'node:path';
import url from 'node:url';

import { isDefined } from 'node_modules/@freik/typechk/lib/esm';

let real_dirname = isDefined(__dirname)
  ? __dirname
  : path.dirname(url.fileURLToPath(import.meta.url));

export function OverrideDirname(newDirname: string): void {
  real_dirname = newDirname;
}

export function GetGlobalDirname(): string {
  return real_dirname;
}

console.log('global_dirname:', real_dirname);

const isProduction = IsProd();
// Dynamically select the right path/asset reference
// const index = isProduction ? prodHtml as string : devHtml;
export function IsProd(): boolean {
  try {
    if (
      isDefined(import.meta) &&
      isDefined(import.meta.env) &&
      isDefined(import.meta.dir)
    ) {
      const prod =
        import.meta.env.NODE_ENV === 'production' ||
        import.meta.dir.includes('node_modules');
      console.log('WE ARE HERE', prod);
      return prod;
    }
  } catch {}
  console.log('Nah:WE ARE HERE:', real_dirname);
  return (
    process.env.NODE_ENV === 'production' || real_dirname.endsWith('/dist')
  );
}
