#!/usr/bin/env bun

// SPDX-License-Identifier: AGPL-3.0-or-later
import { serve } from 'bun';
import path from 'node:path';
import { chdir } from 'node:process';

import index from './index.html';
import { isHMR } from './server/hmr-detection';
import { SetArgs } from './server/getpaths';
import { main } from './server/main';
import { SavePath } from './server/savepath';
import { LoadDatabase, LoadPath, SaveDatabase } from './server/web-interface';

// import darkField from './assets/field-dark.jpg';
// import lightField from './assets/field-light.jpg';

if (!isHMR()) {
  // Resolve any arguments before we change the working directory
  const args = [...process.argv.slice(2), process.cwd()].map((str) =>
    path.resolve(str),
  );
  SetArgs(args);

  // Force the working directory to the directory of the running bundle.
  // Bundling is kinda irritating...
  chdir(import.meta.dir);
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,
    // We could just do "/foo.jpg": Bun.file("file.jpg") but this way keeps them in memory
    // which seems good for the canvas backgrounds...
    // '/assets/field-light.jpg': new Response(await Bun.file(lightField).bytes()),
    // '/assets/field-dark.jpg': new Response(await Bun.file(darkField).bytes()),
    '/api/loadpath/:team/:path': async (req) =>
      LoadPath(
        decodeURIComponent(req.params.team),
        decodeURIComponent(req.params.path),
      ),
    '/api/savepath/:team/:path/:data': async (req) =>
      SavePath(
        decodeURIComponent(req.params.team),
        decodeURIComponent(req.params.path),
        decodeURIComponent(req.params.data),
      ),
    '/api/db': async (req) => LoadDatabase(),
    '/api/putdb': {
      PUT: async (req) => SaveDatabase(JSON.stringify(await req.json())),
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,
    // Echo console logs from the browser to the server
    console: true,
  },
});

main(server.url)
  .then(() => {})
  .catch(console.error);
