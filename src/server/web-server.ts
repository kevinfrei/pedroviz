// SPDX-License-Identifier: AGPL-3.0-or-later

import { serve as serveNode } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { GetGlobalDirname } from './isProduction';
import { SavePath } from './savepath';
import {
  GetFieldImage,
  GetFieldSvg,
  LoadDatabase,
  LoadPath,
  SaveDatabase,
} from './web-interface';

const app = new Hono();

app.get('/img/field/:theme', async (c) => GetFieldImage(c.req.param('theme')));
app.get('/img/svg/:theme', async (c) => GetFieldSvg(c.req.param('theme')));
app.get('/api/loadpath/:team/:path', async (c) => {
  const { team, path } = c.req.param();
  return LoadPath(team, path);
});
app.get('/api/savepath/:team/:path/:data', async (c) => {
  const { team, path, data } = c.req.param();
  return SavePath(team, path, data);
});
app.get('/api/db', async () => LoadDatabase());
app.put('/api/putdb', async (c) => SaveDatabase(JSON.stringify(c.req.json())));
app.get(
  '/',
  serveStatic({
    path: './index.html',
    onNotFound: (path, ctx) => {
      console.error('Index.html file not found: ', path);
    },
  }),
);
app.get(
  '/*',
  serveStatic({
    root: GetGlobalDirname(), // Points to the /dist folder containing your bundled assets
    // Optional fallback for Single Page Apps (SPA routing)
    onNotFound: (path, c) => {
      console.error(`Requested file not found: ${path}`);
    },
  }),
);

// Choose an uncommon default port safely away from FTC/Android tooling
const DEFAULT_PORT = 58888;
const port = Number(process.env.PORT) || DEFAULT_PORT;

let resolvePromise: (value: string) => void;
let rejectPromise: (reason?: any) => void;

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

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    rejectPromise(`Port ${port} already in use: Is the app running elsewhere?`);
  } else {
    rejectPromise(err.name + ': ' + err.message);
  }
});
