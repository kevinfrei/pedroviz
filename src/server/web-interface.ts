// SPDX-License-Identifier: AGPL-3.0-or-later

import { isDefined, isError, Pickle, SafelyUnpickle } from '@freik/typechk';

import { chkPathDatabase } from '../IpcTypeCheck';
import { Path, Team } from '../IpcTypes';
import { GetFieldImagePath, GetThemedSVG } from './FieldImages';
import {
  ReplaceDatabase,
  RescanSourceCode,
  WebGetParsedClassRoot,
} from './full-database';

export async function GetFieldImage(theme: string): Promise<Response> {
  const theTheme = theme !== 'dark' && theme !== 'light' ? 'dark' : theme;
  const imagePath = GetFieldImagePath(theTheme);
  console.log('Image Path: ', imagePath);
  if (isDefined(imagePath)) {
    return new Response(Bun.file(imagePath));
  }

  console.log('Replying with SVG field');
  return new Response(GetThemedSVG(theTheme), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function GetFieldSvg(theme: string): Promise<Response> {
  const theTheme = theme !== 'dark' && theme !== 'light' ? 'dark' : theme;
  console.log('SVG field requested');
  return new Response(GetThemedSVG(theTheme), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

// Send the list of TeamPaths to the client

export async function LoadPath(team: string, path: string): Promise<Response> {
  const pc = WebGetParsedClassRoot(team as Team, path as Path);
  if (isError(pc)) {
    return Response.json({ error: pc.errors().join('\n') });
  }
  return Response.json(JSON.parse(Pickle(pc)));
}

export async function LoadDatabase(): Promise<Response> {
  const codeDb = await RescanSourceCode();
  return Response.json(JSON.parse(Pickle(codeDb)));
}

export async function SaveDatabase(flattenedDb: string): Promise<Response> {
  console.log('Saving DB');
  try {
    const db = SafelyUnpickle(flattenedDb, chkPathDatabase);
    if (isDefined(db)) {
      ReplaceDatabase(db);
    } else {
      return Response.json({ error: 'Failed to unpickle database' });
    }
  } catch (err) {
    return Response.json({ error: 'Crashed while unpickle database' });
  }
  return Response.json({ success: 1 });
}
