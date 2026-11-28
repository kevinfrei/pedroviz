// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';

import { serve as serveNode } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { isDefined } from '@freik/typechk';

import { GetGlobalDirname, OverrideDirname } from './repo-discovery';
import {
  GetFieldImage,
  GetFieldSvg,
  GetTeams,
  GetValidTeams,
  HasFieldImage,
  InstallJsonLoader,
  IsProd,
  KillAssetPathFile,
  LoadPaths,
  SavePaths,
  UploadPaths,
} from './web-interface';

if (isDefined(__dirname)) {
  if (process.argv.length > 1 && process.argv[1]!.endsWith('.ts')) {
    // We're debugging an un-bundled version of the app.
    // Change the directory to <root>/dev
    OverrideDirname(path.resolve(__dirname, '..', '..', 'dev'));
  } else {
    OverrideDirname(path.resolve(__dirname, '..', IsProd() ? 'dist' : 'dev'));
  }
}

const app = new Hono();

app.get('/img/field/:theme', async (c) => GetFieldImage(c.req.param('theme')));
app.get('/img/svg/:theme', async (c) => GetFieldSvg(c.req.param('theme')));
app.get('/api/extimage', async () => HasFieldImage());
app.get('/api/teams', async () => GetTeams());
app.get('/api/valid', async () => GetValidTeams());
app.get('/api/get/:team', async (c) => LoadPaths(c.req.param('team')));
app.put('/api/put/:team', async (c) =>
  SavePaths(c.req.param('team'), await c.req.json<object>()),
);
app.put('/api/adb', async (c) => UploadPaths(await c.req.json<object>()));
app.get('/api/trash', async () => KillAssetPathFile());
app.get('/api/install/:team', async (c) =>
  InstallJsonLoader(c.req.param('team')),
);
app.get(
  '/',
  serveStatic({
    path: './index.html',
    onNotFound: (path) => {
      console.error('Index.html file not found: ', path);
    },
  }),
);
app.get(
  '/*',
  serveStatic({
    root: GetGlobalDirname(), // Points to the /dist folder containing your bundled assets
    // Optional fallback for Single Page Apps (SPA routing)
    onNotFound: (path) => {
      console.error(`Requested file not found: ${path}`);
    },
  }),
);

// Choose an uncommon default port safely away from FTC/Android tooling
const DEFAULT_PORT = 58888;
const port = Number(process.env.PORT) || DEFAULT_PORT;

let resolvePromise: (value: string) => void;
let rejectPromise: (reason?: unknown) => void;

// 2. Create the promise and assign its controls to the outer scope
export const GetUrl = new Promise<string>((resolve, reject) => {
  resolvePromise = resolve;
  rejectPromise = reject;
});

const server = serveNode(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    resolvePromise(`http://localhost:${info.port}`);
  },
);

server.on('error', (err /*: NodeJS.ErrnoException*/) => {
  if (err.code === 'EADDRINUSE') {
    rejectPromise(`Port ${port} already in use: Is the app running elsewhere?`);
  } else {
    rejectPromise(err.name + ': ' + err.message);
  }
});
