// SPDX-License-Identifier: AGPL-3.0-or-later

import { Sleep } from '@freik/sync';

import { RescanSourceCode } from './full-database';
import { OpenBrowser } from './open-browser';

// Scan the files
export async function main(url: string) {
  console.log('Parsing code: Please wait...');
  await RescanSourceCode();
  console.log(`🚀 Server running at ${url}`);
  // Delay to let some stuff get moving. This is annoying, but
  // necessary, AFAICT.
  // Comment these out while developing, as it's annoying with constant re-launches
  await Sleep(1500);
  OpenBrowser(url.toString());
}
