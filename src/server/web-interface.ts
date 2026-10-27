// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fsp } from 'node:fs';
import path from 'node:path';

import { JSONObject } from 'node_modules/hono/dist/types/utils/types';
import {
  isDefined,
  Pickle,
  SafelyUnpickle,
  SimpleObject,
} from '@freik/typechk';

import { chkNamedValues, NamedValues } from '../dataTypes';
import { PathsFile, Team, TeamList } from '../ipcTypes';
import {
  CheckForFieldImages,
  GetFieldImagePath,
  GetThemedSVG,
} from './field-images';
import {
  GetJsonPathForTeam,
  GetTeamNames,
  GetTeamsWithPaths,
  LoadPathsForTeam,
} from './path-interface';
import { isDirectory } from './utility-funcs';

export async function GetFieldImage(theme: string): Promise<Response> {
  const theTheme = theme !== 'dark' && theme !== 'light' ? 'dark' : theme;
  const imagePath = GetFieldImagePath(theTheme);
  if (isDefined(imagePath)) {
    return new Response(Bun.file(imagePath));
  }

  return new Response(GetThemedSVG(theTheme), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function GetFieldSvg(theme: string): Promise<Response> {
  const theTheme = theme !== 'dark' && theme !== 'light' ? 'dark' : theme;
  return new Response(GetThemedSVG(theTheme), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function HasFieldImage(): Promise<Response> {
  const res = await CheckForFieldImages();
  return Response.json(res);
}

export async function GetTeams(): Promise<Response> {
  const teams: TeamList = await GetTeamNames();
  return Response.json(teams);
}

export async function GetValidTeams(): Promise<Response> {
  const teams: TeamList = await GetTeamsWithPaths();
  return Response.json(teams);
}

export async function LoadPaths(team: Team): Promise<Response> {
  const pathsFile: PathsFile = await LoadPathsForTeam(team);
  // This is kind of round-about, but Response.json pickles, and I want to
  // use my own pickling (marshalling...) framework, cuz I likes it.
  return Response.json(JSON.parse(Pickle(pathsFile)));
}

export async function SavePaths(team: Team, json: Object): Promise<Response> {
  console.error('Save request for team', team);
  if (!chkNamedValues(json)) {
    console.error('Wrong type :/', json);
  } else {
    // TODO: Actually save this
    const jsonPath = await GetJsonPathForTeam(team);
    const dir = path.dirname(jsonPath);
    if (!(await isDirectory(dir))) {
      fsp.mkdir(dir, { recursive: true });
    }
    await fsp.writeFile(jsonPath, JSON.stringify(json, undefined, 2), 'utf8');
    console.error('File written!');
  }
  return Response.json({ error: 'NYI' });
}
