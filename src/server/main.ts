// SPDX-License-Identifier: AGPL-3.0-or-later

import { sleep } from 'bun';

import { CheckForFieldImages } from './FieldImages';
import { RescanSourceCode } from './full-database';
import { OpenBrowser } from './open-browser';

// Scan the files
export async function main(url: URL) {
  console.log('Parsing code: Please wait...');
  await RescanSourceCode();
  await CheckForFieldImages();
  console.log(`🚀 Server running at ${url}`);
  // Delay to let some stuff get moving. This is annoying, but
  // necessary, AFAICT.
  // Comment these out while developing, as it's annoying with constant re-launches
  await sleep(1500);
  OpenBrowser(url.toString());
}
