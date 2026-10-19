// SPDX-License-Identifier: AGPL-3.0-or-later

import fs, { promises as fsp } from 'node:fs';
import path from 'node:path';

import { MakeMultiMap } from '@freik/containers';
import { isDefined, isNull, isString } from '@freik/typechk';

import { GetPathKey } from '../IpcTypeCheck';
import { FilePath, FilePathKey, Team, TeamFilePath } from '../IpcTypes';
import { GetGlobalDirname } from './isProduction';
import { isDirectory } from './utility';

let RepoRoot: string | null = null;
let args: string[] = [];

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

/*export async function obliterateRepoRoot() {
  RepoRoot = null;
}*/

export function GetRelativeRepoRoot(): string {
  if (isNull(RepoRoot)) {
    throw new Error('Unable to find FtcRobotController/TeamCode home');
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

export async function GetTeamPaths(): Promise<TeamFilePath> {
  if (isNull(RepoRoot)) {
    await FindRelativeRepoRoot([...args, process.cwd(), GetGlobalDirname()]);
  }
  if (isNull(RepoRoot)) {
    throw new Error('Unable to find repository root');
  }
  // Get the list of all team code roots
  const teamDirs = await GetTeamDirectories();
  // Next, look for paths in each team directory
  const filePaths: TeamFilePath = new Map<Team, FilePathKey>();
  for (const teamName of teamDirs) {
    const pathFile = await GetPathFile(RepoRoot, teamName);
    if (isDefined(pathFile)) {
      const pathKey = GetPathKey(teamName, pathFile);
      filePaths.set(teamName, pathKey);
    }
  }
  return filePaths;
}

// Find a pedropaths.json file in the team's asset directory
export async function GetPathFile(
  repoRoot: string,
  teamName: string,
): Promise<FilePath | undefined> {
  const jsonFile = path.join(repoRoot, teamName, RelativePathsJsonFile);
  return (await fsp.exists(jsonFile)) ? jsonFile : undefined;
}

export async function GetTeamDirectories(): Promise<Team[]> {
  if (isNull(RepoRoot)) {
    throw new Error('Unknonw repository location');
  }
  const entries = await fsp.readdir(RepoRoot, { withFileTypes: true });
  const teamDirs = entries
    .filter((dir) => isTeamDirectory(RepoRoot!, dir))
    .map((dir) => dir.name as Team);
  return teamDirs;
}

// A directory is a team directory if:
// - It is a directory
// - Its name does not start with a .
// - Its name is not "FtcRobotController"
// - It contains a 'build.gradle' file
// - It has a 'src/main/java/org/firstinspires/ftc/<team-name>' subdirectory
// - It is referred to in the settings.gradle file at the repo root (NYI)
function isTeamDirectory(repoRoot: string, dir: fs.Dirent): boolean {
  if (!dir.isDirectory()) {
    return false;
  }
  const name = dir.name;
  if (name[0] === '.') {
    return false;
  }
  if (name === 'FtcRobotController') {
    return false;
  }
  // Check for the presence of a 'build.gradle' file
  const buildGradlePath = path.join(repoRoot, dir.name, 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    return false;
  }
  // Check for the presence of the 'src/main/java/org/firstinspires/ftc/<team-name>' subdirectory
  const teamSrcPath = path.join(
    repoRoot,
    dir.name,
    FirstFtcSrc,
    dir.name.toLocaleLowerCase(),
  );
  if (!fs.existsSync(teamSrcPath) || !isDirectory(teamSrcPath)) {
    return false;
  }
  // TODO: Ensure that the directory is included in the settings.gradle file
  /*
  const settingsGradlePath = path.join(repoRoot, 'settings.gradle');
  if (!fs.existsSync(settingsGradlePath)) {
    return false;
  }
  const settingsGradleContent = fs.readFileSync(settingsGradlePath, 'utf-8');
  if (!settingsGradleContent.includes(dir.name)) {
    return false;
  }
  */
  return true;
}

export function GetProjectFilePath(team: string, filename: string): string {
  return path.join(
    GetRelativeRepoRoot(),
    team,
    FirstFtcSrc,
    team.toLocaleLowerCase(),
    filename,
  );
}

export const FirstFtcSrc = path.join(
  'src',
  'main',
  'java',
  'org',
  'firstinspires',
  'ftc',
);

export const RelativePathsJsonFile = path.join(
  'src',
  'main',
  'res',
  'paths',
  'pedropaths.json',
);
