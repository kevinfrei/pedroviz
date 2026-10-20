// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';

import { PathsFile, Team } from '../ipcTypes';
import { CheckForFieldImages } from './field-images';
import { GetTeamsWithPaths, LoadPathsForTeam } from './path-interface';
import { PathsDatabase } from './server-types';

const database: PathsDatabase = {
  HasFieldImage: false,
  AllTeams: new Set<Team>(),
  LoadedFiles: new Map<Team, PathsFile>(),
};

/*export*/ function GetDatabase(): PathsDatabase {
  return database;
}

export function ResetDatabase() {
  database.AllTeams.clear();
  database.LoadedFiles.clear();
  database.HasFieldImage = false;
}

// Interfaces to the web server to talk to the web client:
export async function RescanSourceCode(): Promise<PathsDatabase> {
  ResetDatabase();
  database.HasFieldImage = await CheckForFieldImages();
  const teamPaths = await GetTeamsWithPaths();
  for (const team of teamPaths) {
    const jsonFile = await LoadPathsForTeam(team);
    database.LoadedFiles.set(team, jsonFile);
  }
  return GetDatabase();
}

// Useful for debugging:
// if (import.meta.main) {
//   PopulateDatabase()
//     .then(() => console.log('done'))
//     .catch(console.error);
// }
