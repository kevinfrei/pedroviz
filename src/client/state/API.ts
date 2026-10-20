// SPDX-License-Identifier: AGPL-3.0-or-later

import { isBoolean, isString, MakeError } from '@freik/typechk';

import { Curve, Path, Pose } from '../../dataTypes';
import { chkPathsFile, chkTeamList, PathsFile, Team } from '../../ipcTypes';
import { fetchApi, putApi } from './Storage';

// Some of the logic seems a little odd, because I want the validation to fully
// run on everything so I'm avoiding any logical short-circuiting...

const colorLookup: Map<string, number> = new Map();
let colorCount = 0;

// This provides a consistent color for a given curve/pose
export function getColorFor(item: string | Curve | Path | Pose): number {
  if (isString(item)) {
    if (!colorLookup.has(item)) {
      colorLookup.set(item, colorCount++);
    }
    return colorLookup.get(item)!;
  }
  return getColorFor(JSON.stringify(item));
}

export async function HasFieldImage(): Promise<boolean> {
  return await fetchApi('extimage', isBoolean, false);
}

export async function GetTeams(): Promise<Team[]> {
  return await fetchApi('teams', chkTeamList, []);
}

export async function GetValidTeams(): Promise<Team[]> {
  return await fetchApi('valid', chkTeamList, []);
}

// Get the entire Database from the server
export async function GetPaths(team: Team): Promise<PathsFile> {
  return await fetchApi(
    `get/${team}`,
    chkPathsFile,
    MakeError(`get/${team} server respons error`),
  );
}

export async function PutPaths(team: Team, db: PathsFile): Promise<void> {
  return putApi(`put/${team}`, db);
}
