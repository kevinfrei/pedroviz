// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fsp } from 'node:fs';
import path from 'node:path';

import { isDefined, Pickle } from '@freik/typechk';

import { chkNamedValues } from '../dataTypes';
import { PathsFile, Team, TeamList } from '../ipcTypes';
import { pushFile, trashFile } from './adb';
import {
  CheckForFieldImages,
  GetFieldImagePath,
  GetThemedSVG,
} from './field-images';
import {
  GetJsonPathForTeam,
  GetProjectFilePath,
  GetTeamNames,
  GetTeamsWithPaths,
  LoadPathsForTeam,
} from './path-interface';
import jsonLoaderSource from './PedroViz.java';
import { GetRelativeRepoRoot } from './repo-discovery';
import { isDirectory } from './utility-funcs';

export async function GetFieldImage(theme: string): Promise<Response> {
  const theTheme = theme !== 'dark' && theme !== 'light' ? 'dark' : theme;
  const imagePath = GetFieldImagePath(theTheme);
  if (isDefined(imagePath)) {
    const file = new File(
      [await fsp.readFile(imagePath)],
      path.basename(imagePath),
      {
        type: imagePath.toLocaleLowerCase().endsWith('png')
          ? 'image/png'
          : 'image/jpeg',
      },
    );
    return new Response(file);
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

export async function SavePaths(team: Team, json: object): Promise<Response> {
  // console.error('Save request for team', team);
  if (!chkNamedValues(json)) {
    console.error('Invalid JSON file', json);
    return Response.json({ error: 'Invalid JSON file' });
  }
  const jsonPath = await GetJsonPathForTeam(team);
  await mkdirIfNotThere(jsonPath);
  // Stick a timestamp on, so that the Java loader can pick the 'newest' file
  json.timeStamp = Date.now();
  json.schema = 0;
  await fsp.writeFile(jsonPath, JSON.stringify(json, undefined, 2), 'utf8');
  // console.error('File written!');
  return Response.json({ okay: true });
}

async function mkdirIfNotThere(jsonPath: string) {
  const dir = path.dirname(jsonPath);
  if (!(await isDirectory(dir))) {
    fsp.mkdir(dir, { recursive: true });
  }
}

export async function UploadPaths(json: object): Promise<Response> {
  if (!chkNamedValues(json)) {
    console.error('Invalid JSON file', json);
    return Response.json({ error: 'Invalid JSON file' });
  }
  // Stick a timestamp on, so that the Java loader can pick the 'newest' file
  json.timeStamp = Date.now();
  json.schema = 0;
  const res = await pushFile(json);
  if (res === 'success') {
    return Response.json({ result: 0 });
  }
  return Response.json({ error: res });
}

export async function KillAssetPathFile(): Promise<Response> {
  const res = await trashFile();
  if (res === 'success') {
    return Response.json({ result: 0 });
  }
  return Response.json({ error: res });
}

export async function InstallJsonLoader(team: Team): Promise<Response> {
  const fileLocation = GetProjectFilePath(
    await GetRelativeRepoRoot(),
    team,
    path.join('jsonloader', 'PedroViz.java'),
  );
  await mkdirIfNotThere(fileLocation);
  await fsp.writeFile(fileLocation, jsonLoaderSource, { encoding: 'utf8' });
  return Response.json({ result: 0 });
}
