// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { isMultiMapOf } from '@freik/containers';
import { isString } from '@freik/typechk';

import { Team } from '../../ipcTypes';
import { GetTeamNames } from '../path-interface';
import { FindRelativeRepoRoot } from '../repo-discovery';

function getTestRepoPath(): string {
  return path.resolve(__dirname, 'test-repo-root');
}

const originalCwd = process.cwd();

beforeEach(() => {
  // Change to a specific test directory before each test
  process.chdir(path.resolve(__dirname, 'test-repo-root', 'docs'));
});

afterEach(() => {
  // Always restore the original working directory so subsequent tests aren't broken
  process.chdir(originalCwd);
});

describe('team path exploration', () => {
  test('getRelativeRepoRoot finds the repo root', async () => {
    const currentPath = getTestRepoPath();
    const repoRoot = await FindRelativeRepoRoot(currentPath);
    expect(repoRoot).toBe(currentPath);
  });

  test('getRelativeRepoRoot fails if no repo root found', async () => {
    const invalidPath = path.resolve(
      __dirname,
      '../../../../../nonexistent/path',
    );
    console.log(invalidPath);
    expect(await FindRelativeRepoRoot(invalidPath)).toBeNull();
  });

  test('getRelativeRoot finds the test repository root', async () => {
    const testRepoPath = getTestRepoPath();
    const repoRoot = await FindRelativeRepoRoot(
      path.join(testRepoPath, 'some', 'nested', 'directory'),
      8,
    );
    expect(repoRoot).toBe(testRepoPath);
  });

  test('getTeamDirectories finds team directories', async () => {
    const repoRoot = await getTestRepoPath();
    const teamDirs = await GetTeamNames();
    expect(teamDirs).toContain('TeamA' as Team);
    expect(teamDirs).toContain('TeamB' as Team);
  });
});
