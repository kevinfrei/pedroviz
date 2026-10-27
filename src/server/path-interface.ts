// SPDX-License-Identifier: AGPL-3.0-or-later

import fs, { promises as fsp } from 'node:fs';
import path from 'node:path';

import {
  chkArrayOf,
  chkRecordOf,
  hasField,
  hasFieldOf,
  isArray,
  isDefined,
  isRecord,
  isString,
  isUndefined,
  MakeError,
  SafelyUnpickle,
} from '@freik/typechk';

import {
  chkCurveRef,
  chkInterpRef,
  chkNamedValues,
  chkPath,
  chkPoseRef,
  chkValRef,
  chkValue,
} from '../dataTypes';
import { PathsFile, Team } from '../ipcTypes';
import { GetRelativeRepoRoot } from './repo-discovery';
import { FilePath } from './server-types';
import { isDirectory } from './utility-funcs';

export async function GetTeamsWithPaths(): Promise<Team[]> {
  const repo = await GetRelativeRepoRoot();
  // Get the list of all team code roots
  const teamDirs = await GetTeamNames();
  // Next, look for paths in each team directory
  const validTeams: Team[] = [];
  for (const teamName of teamDirs as Team[]) {
    const pathFile = await GetPathFile(repo, teamName);
    if (isDefined(pathFile)) {
      validTeams.push(teamName);
    }
  }
  return validTeams;
}

// Find a pedropaths.json file in the team's asset directory
export async function GetPathFile(
  repoRoot: string,
  teamName: string,
): Promise<FilePath | undefined> {
  const jsonFile = path.join(repoRoot, teamName, RelativePathsJsonFile);
  return (await fsp.exists(jsonFile)) ? jsonFile : undefined;
}

export async function GetTeamNames(): Promise<Team[]> {
  const repo = await GetRelativeRepoRoot();
  console.log('Repo:', repo);
  const entries = await fsp.readdir(repo, { withFileTypes: true });
  const teamDirs = entries
    .filter((dir) => isTeamDirectory(repo!, dir))
    .map((dir) => dir.name as Team);
  return teamDirs;
}

export async function LoadPathsForTeam(team: Team): Promise<PathsFile> {
  try {
    const jsonPath = await GetJsonPathForTeam(team);
    const data = await fsp.readFile(jsonPath, 'utf8');
    const res = SafelyUnpickle(data, chkNamedValues);
    if (isUndefined(res)) {
      // Dig much further into why the JSON file is malformed
      const r = JSON.parse(data);
      console.log(Object.keys(r));
      for (const k of Object.keys(r)) {
        if (k === 'interpolations') {
          const i = r[k];
          for (const ik of Object.keys(i)) {
            console.log(ik, i[ik], chkInterpRef(i[ik]));
          }
        }
      }
      console.log(
        'Values',
        hasFieldOf(r, 'values', chkRecordOf(isString, chkValRef)),
      );
      console.log(
        'Poses',
        hasFieldOf(r, 'poses', chkRecordOf(isString, chkPoseRef)),
      );
      console.log(
        'Interps',
        hasFieldOf(r, 'interpolations', chkRecordOf(isString, chkInterpRef)),
      );
      console.log(
        'Curves',
        hasFieldOf(r, 'curves', chkRecordOf(isString, chkCurveRef)),
      );
      console.log(
        'Paths',
        hasFieldOf(r, 'paths', chkRecordOf(isString, chkPath)),
      );
      return MakeError(
        "JSON path file doesn't appear to be the right structure",
      );
    }
    return res;
  } catch (e) {
    return MakeError((e as unknown as Object).toString());
  }
}

export async function GetJsonPathForTeam(team: string) {
  const repo = await GetRelativeRepoRoot();
  const jsonPath = GetJsonFilePath(repo, team);
  return jsonPath;
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
  const teamSrcPath = path.join(repoRoot, name, FirstFtcSrc, 'teamcode');
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
/*
export function GetProjectFilePath(repo: string, team: string, filename: string): string {
  return path.join(
    repo,
    team,
    FirstFtcSrc,
    team.toLocaleLowerCase(),
    filename,
  );
}
*/
export function GetJsonFilePath(repo: string, team: string): string {
  return path.join(repo, team, RelativePathsJsonFile);
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
