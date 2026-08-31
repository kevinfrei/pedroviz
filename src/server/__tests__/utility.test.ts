// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect /* beforeAll, afterAll */, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

import { FirstFtcSrc, GetProjectFilePath } from '../getpaths';
import { isDirectory } from '../utility';

function getTestRepoPath(): string {
  return path.resolve(__dirname, 'test-repo-root');
}

test('getProjectFilePath simple test', () => {
  expect(GetProjectFilePath('TestTeam', 'FileName.java')).toBe(
    path.join(
      getTestRepoPath(),
      'TestTeam',
      FirstFtcSrc,
      'testteam',
      'FileName.java',
    ),
  );
});

test('isDirectory testing', async () => {
  expect(await isDirectory(__dirname)).toBe(true);
  expect(await isDirectory(path.join(__dirname, 'nonexistent_directory'))).toBe(
    false,
  );
  expect(fs.existsSync(__filename)).toBe(true);
  expect(await isDirectory(__filename)).toBe(false);
});
