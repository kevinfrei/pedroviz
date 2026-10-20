// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fsp } from 'node:fs';
import path from 'node:path';

import { isNull, isString } from '@freik/typechk';

import { GetGlobalDirname } from './is-prod';
import { isDirectory } from './utility-funcs';

let RepoRoot: string | null = null;
export let args: string[] = [];

export function SetArgs(strs: string[]): void {
  args = strs;
}

export async function SetRepoRoot(repoRoot: string): Promise<boolean> {
  if (await isRepoRoot(repoRoot)) {
    RepoRoot = repoRoot;
    return true;
  }
  return false;
}

export async function GetRelativeRepoRoot(): Promise<string> {
  if (isNull(RepoRoot)) {
    const params = [...args, process.cwd(), GetGlobalDirname()];
    RepoRoot = await FindRelativeRepoRoot(params);
    if (RepoRoot === null) {
      throw new Error(
        `Unable to find FtcRobotController/TeamCode home:\n${params.join('\n')}`,
      );
    }
  }
  return RepoRoot;
}

export async function FindRelativeRepoRoot(
  dirsToCheck: string | string[],
  maxParent: number = 8,
): Promise<string | null> {
  let prevPath = '';
  const checking = isString(dirsToCheck) ? [dirsToCheck] : dirsToCheck;
  for (let currentPath of checking) {
    let parent = maxParent;
    while (currentPath != prevPath && parent > 0) {
      if (await SetRepoRoot(currentPath)) {
        return currentPath;
      }
      prevPath = currentPath;
      currentPath = path.dirname(currentPath);
      parent--;
    }
  }
  console.error('Unable to find any potential repositories:', dirsToCheck);
  return null;
}

async function isRepoRoot(currentPath: string) {
  return (
    (await fsp.exists(path.join(currentPath, 'settings.gradle'))) &&
    (await fsp.exists(path.join(currentPath, 'build.gradle'))) &&
    (await fsp.exists(path.join(currentPath, 'FtcRobotController'))) &&
    (await isDirectory(path.join(currentPath, 'FtcRobotController')))
  );
}
