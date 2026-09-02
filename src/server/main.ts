// SPDX-License-Identifier: AGPL-3.0-or-later

import { Sleep } from '@freik/sync';

import { RescanSourceCode } from './full-database';
import { OpenBrowser } from './open-browser';

// Scan the files
export async function main(url: string) {
  await RescanSourceCode();
  console.log(`🚀 🚀 🚀 🚀 🚀
Pedro Visualization application is running at ${url}

(Your browser should open automatically, but if it doesn't, open a browser
and go to that URL. The 'http://' is important, as the browser will not allow
the application to run without it.)

*********************************************
>>> Press Ctrl+C to stop the application. <<<
*********************************************
`);
  // Delay to let some stuff get moving. This is annoying, but
  // necessary, AFAICT.
  // Comment these out while developing, as it's annoying with constant re-launches
  await Sleep(1500);
  OpenBrowser(url.toString());
}
