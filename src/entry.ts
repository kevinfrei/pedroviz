#!/usr/bin/env bun

// SPDX-License-Identifier: AGPL-3.0-or-later
import path from 'node:path';
import process from 'node:process';

import { isDefined } from '@freik/typechk';

import { SetArgs } from './server/getpaths';
import { GetGlobalDirname, OverrideDirname } from './server/isProduction';
import { main } from './server/main';
import { GetUrl } from './server/web-server';

if (isDefined(__dirname)) {
  OverrideDirname(__dirname);
}

// Resolve any arguments before we change the working directory
const args = [...process.argv.slice(2), process.cwd()].map((str) =>
  path.resolve(str),
);
SetArgs(args);

// Force the working directory to the directory of the running bundle.
// Bundling is kinda irritating...
process.chdir(GetGlobalDirname());

// Serve all files from the directory where this compiled bundle lives
GetUrl.then(main).catch(console.error);
