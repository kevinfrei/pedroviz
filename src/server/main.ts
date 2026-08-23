// SPDX-License-Identifier: AGPL-3.0-or-later

import { sleep } from 'bun';

import { RescanSourceCode } from './full-database';
import { registerDirectory } from './getpaths';
import { OpenBrowser } from './open-browser';

// Scan the files
export async function main(url: URL) {
  // First, check for a command line argument
  const args = process.argv;
  console.log('args:', args);
  if (args.length > 2) {
    registerDirectory(args.slice(2));
  }
  console.log('Parsing code: Please wait...');
  await RescanSourceCode();
  console.log(`🚀 Server running at ${url}`);
  // Delay to let some stuff get moving. This is annoying, but
  // necessary, AFAICT.
  // Comment these out while developing, as it's annoying with constant re-launches
  await sleep(1500);
  OpenBrowser(url.toString());
}
