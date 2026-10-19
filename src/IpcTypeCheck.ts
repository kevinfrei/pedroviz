// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkMapOf,
  chkObjectOfExactType,
  chkSetOf,
  isBoolean,
  isMap,
  isString,
} from '@freik/typechk';

import { FilePath, FilePathKey, JsonPathDatabase, Team } from './IpcTypes';

export function GetPathKey(team: Team, path: FilePath): FilePathKey {
  return `${team}*${path}` as FilePathKey;
}

export function FilePathFromKey(pathKey: FilePathKey): FilePath {
  const elems = pathKey.split('*');
  return (elems.pop() || '') as FilePath;
}

export function chkPathKey(obj: unknown): obj is FilePathKey {
  if (!isString(obj)) {
    return false;
  }
  const pieces = obj.split('*');
  return pieces.length === 2;
}

export const chkTeamFilePath = chkMapOf(isString, isString);
export const chkJsonPathDatabase = chkObjectOfExactType<JsonPathDatabase>({
  HasFieldImage: isBoolean,
  AllTeams: chkSetOf(isString),
  TeamsWithFiles: chkSetOf(isString),
  ParsedFiles: isMap,
});
