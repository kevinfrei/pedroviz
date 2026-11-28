// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { isError } from 'node_modules/@freik/typechk/lib/esm';

import { Team } from '../../ipcTypes';
import {
  GetProjectFilePath,
  GetTeamNames,
  GetTeamsWithPaths,
  LoadPathsForTeam,
} from '../path-interface';
import { FindRelativeRepoRoot } from '../repo-discovery';

function getTestRepoPath(): string {
  return path.resolve(__dirname, 'test-repo-root');
}

function getTeamCodePath(): string {
  return path.resolve(__dirname, 'teamcode-repo');
}

const originalCwd = process.cwd();

describe('Multi-team path exploration', () => {
  beforeEach(() => {
    // Change to a specific test directory before each test
    process.chdir(path.join(getTestRepoPath(), 'docs'));
  });

  afterEach(() => {
    // Always restore the original working directory so subsequent tests aren't broken
    process.chdir(originalCwd);
  });

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
    const teamDirs = await GetTeamNames();
    expect(teamDirs).toContain('TeamA' as Team);
    expect(teamDirs).toContain('TeamB' as Team);
    expect(teamDirs).toContain('LearnBot' as Team);
  });

  test('GetTeamsWithPaths finds team directories', async () => {
    const teamDirs = await GetTeamsWithPaths();
    expect(teamDirs).toBeArrayOfSize(3);
  });

  test('LoadPathsForTeam', async () => {
    const badPathsFile = await LoadPathsForTeam('TeamB');
    expect(badPathsFile).toBeDefined();
    expect(isError(badPathsFile)).toBeTrue();
    const pathsFile = await LoadPathsForTeam('TeamA');
    expect(pathsFile).toBeDefined();
    expect(isError(pathsFile)).toBeTrue();
  });
});

describe('single-team path exploration', () => {
  beforeEach(() => {
    // Change to a specific test directory before each test
    process.chdir(getTeamCodePath());
  });

  afterEach(() => {
    // Always restore the original working directory so subsequent tests aren't broken
    process.chdir(originalCwd);
  });

  test('getRelativeRepoRoot finds the repo root', async () => {
    const currentPath = getTeamCodePath();
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
    const testRepoPath = getTeamCodePath();
    const repoRoot = await FindRelativeRepoRoot(
      path.join(testRepoPath, 'some', 'nested', 'directory'),
      8,
    );
    expect(repoRoot).toBe(testRepoPath);
  });

  test('getTeamDirectories finds team directories', async () => {
    const teamDirs = await GetTeamNames();
    expect(teamDirs).toContain('TeamCode' as Team);
    expect(teamDirs).toBeArrayOfSize(1);
  });

  test('GetTeamsWithPaths finds team directories', async () => {
    const teamDirs = await GetTeamsWithPaths();
    expect(teamDirs).toBeArrayOfSize(1);
    expect(teamDirs).toContain('TeamCode');
  });

  test('LoadPathsForTeam', async () => {
    const pathsFile = await LoadPathsForTeam('TeamCode');
    expect(pathsFile).toBeDefined();
    expect(isError(pathsFile)).toBeFalse();
    if (isError(pathsFile)) return;
    expect(pathsFile.timeStamp).toBeDefined();
    expect(pathsFile.schema).toEqual(0);
    expect(pathsFile.values).toBeObject();
    const valKeys = Object.keys(pathsFile.values);
    expect(valKeys).toBeArrayOfSize(1);
    expect(pathsFile.values[valKeys[0]!]).toEqual({ val: 95 });
    expect(pathsFile.poses).toBeObject();
    expect(pathsFile.interpolations).toBeObject();
    expect(pathsFile.curves).toBeObject();
    expect(pathsFile.paths).toBeObject();
  });
  test('GetProjectFilePath', () => {
    const filePath = GetProjectFilePath('abc', 'TeamCode', 'filename.java');
    expect(filePath).toEqual(
      'abc/TeamCode/src/main/java/org/firstinspires/ftc/teamcode/filename.java',
    );
  });
});
