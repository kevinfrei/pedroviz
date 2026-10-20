// SPDX-License-Identifier: AGPL-3.0-or-later

import { isDefined, Pickle, SafelyUnpickle } from '@freik/typechk';

import { chkNamedValues, NamedValues } from '../dataTypes';
import { PathsFile, Team, TeamList } from '../ipcTypes';
import {
  CheckForFieldImages,
  GetFieldImagePath,
  GetThemedSVG,
} from './field-images';
import {
  GetTeamNames,
  GetTeamsWithPaths,
  LoadPathsForTeam,
} from './path-interface';

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

export async function SavePaths(
  team: Team,
  flattenedPaths: string,
): Promise<Response> {
  const paths: NamedValues | undefined = SafelyUnpickle(
    flattenedPaths,
    chkNamedValues,
  );
  // TODO: Actually save this
  console.error("NYI: We don't save data yet!");
  return Response.json({ error: 'NYI' });
}
