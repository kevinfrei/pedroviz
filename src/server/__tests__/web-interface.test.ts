// SPDX-License-Identifier: AGPL-3.0-or-later

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as path from 'node:path';

import { Team } from 'src/ipcTypes';

import { chkNamedValues } from '../../dataTypes';
import {
  FindRelativeRepoRoot,
  GetGlobalDirname,
  OverrideDirname,
} from '../repo-discovery';
import {
  GetFieldImage,
  GetFieldSvg,
  GetTeams,
  GetValidTeams,
  HasFieldImage,
  IsProd,
  LoadPaths,
} from '../web-interface';

function getTestRepoPath(): string {
  return path.resolve(__dirname, 'test-repo-root');
}

function getTeamCodePath(): string {
  return path.resolve(__dirname, 'teamcode-repo');
}

const originalCwd = process.cwd();

describe('Multi-bot web interfaces', () => {
  beforeEach(() => {
    // Change to a specific test directory before each test
    process.chdir(path.join(getTestRepoPath(), 'docs'));
  });
  afterEach(() => {
    // Always restore the original working directory so subsequent tests aren't broken
    process.chdir(originalCwd);
  });
  test('Field Image support', async () => {
    const hasImage = await HasFieldImage();
    expect(hasImage.ok).toBeTrue();
    expect(hasImage.status).toEqual(200);
    const res = await hasImage.text();
    expect(res).toEqual('false');
    const fieldImage = await GetFieldImage('dark');
    expect(fieldImage.ok).toBeTrue();
    const blob = await fieldImage.blob();
    expect(blob.type).toEqual('image/svg+xml');
  });
  test('Is Production', () => {
    const isProd = IsProd();
    expect(isProd).toBeFalse();
    const global = GetGlobalDirname();
    OverrideDirname('asdf');
    const global2 = GetGlobalDirname();
    expect(global).not.toEqual(global2);
    expect(global2).toBe('asdf');
  });
});

describe('Single-bot repo web interface tests', () => {
  beforeEach(() => {
    // Change to a specific test directory before each test
    process.chdir(getTeamCodePath());
  });
  afterEach(() => {
    // Always restore the original working directory so subsequent tests aren't broken
    process.chdir(originalCwd);
  });
  test('Set the repo to the next one', async () => {
    const currentPath = getTeamCodePath();
    const repoRoot = await FindRelativeRepoRoot(currentPath);
    expect(repoRoot).toBe(currentPath);
  });
  test('Field Image support', async () => {
    const hasImage = await HasFieldImage();
    expect(hasImage.ok).toBeTrue();
    expect(hasImage.status).toEqual(200);
    const res = await hasImage.text();
    expect(res).toEqual('true');
    const fieldImage = await GetFieldImage('dark');
    expect(fieldImage.ok).toBeTrue();
    const blob = await fieldImage.blob();
    expect(blob.type).toEqual('image/jpeg');
    const fieldLImage = await GetFieldImage('light');
    expect(fieldLImage.ok).toBeTrue();
    const blob2 = await fieldLImage.blob();
    expect(blob2.type).toEqual('image/png');
    const svg = await GetFieldSvg('light');
    expect(svg.ok).toBeTrue();
    const sblob = await svg.blob();
    expect(sblob.type).toEqual('image/svg+xml');
  });
  test('Team listing stuff', async () => {
    const teamsResp = await GetTeams();
    expect(teamsResp.ok).toBeTrue();
    const teams = await teamsResp.json();
    expect(teams).toBeArrayOfSize(1);
    expect(teams).toEqual(['TeamCode']);
    const vteamsResp = await GetValidTeams();
    expect(vteamsResp.ok).toBeTrue();
    const vteams = await vteamsResp.json();
    expect(vteams).toBeArrayOfSize(1);
    const pathsResp = await LoadPaths('TeamCode' as Team);
    expect(pathsResp.ok).toBeTrue();
    const paths = await pathsResp.json();
    expect(chkNamedValues(paths)).toBeTrue();
    if (!chkNamedValues(paths)) return;
    expect(paths.timeStamp).toBeGreaterThan(10000);
    expect(paths.schema).toEqual(0);
    expect(Object.keys(paths.values)).toEqual(['newValue1']);
    expect(paths.values['newValue1']).toEqual({ val: 95 });
  });
});
