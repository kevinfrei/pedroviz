// SPDX-License-Identifier: AGPL-3.0-or-later

import { MakeMultiMap } from '@freik/containers';
import { ErrorOr, isError, isUndefined, MakeError } from '@freik/typechk';

import { ParsedClass } from '../CodeTypes';
import {
  ClassFromKey,
  getClassKey,
  getPathKey,
  PathFromKey,
} from '../IpcTypeCheck';
import {
  ClassKey,
  ClassName,
  Path,
  PathDatabase,
  PathKey,
  Team,
} from '../IpcTypes';
import { CheckForFieldImages } from './FieldImages';
import { GetProjectFilePath, GetTeamPaths } from './getpaths';
import { anyItems, MakeParsedClass } from './PathChainLoader';

// Teams -> Paths -> Classes   -> ParsedClasse
// one   -> many  -> many, one -> one

const database: PathDatabase = {
  HasFieldImage: false,
  TeamPaths: MakeMultiMap<Team, PathKey>(),
  PathClasses: MakeMultiMap<PathKey, ClassKey>(),
  ParsedClasses: new Map<ClassKey, ParsedClass>(),
};

export function ForEachPathChainIndex(
  top: ParsedClass,
  funcStop: (pc: ParsedClass) => true | unknown,
): void {
  const work = [top];
  while (work.length > 0) {
    const item = work.pop()!;
    if (funcStop(item) === true) {
      return;
    }
    work.push(...Object.values(item.children));
  }
}

async function GetPathChainIndex(
  team: string,
  file: string,
): Promise<ErrorOr<ParsedClass>> {
  const filepath = GetProjectFilePath(team, file);
  return await MakeParsedClass(filepath);
}

function RegisterTopLevelParsedClass(
  team: Team,
  path: Path,
  pc: ParsedClass,
): void {
  if (!anyItems(pc)) {
    return;
  }
  const pathKey = getPathKey(team, path);
  database.TeamPaths.set(team, pathKey);
  ForEachPathChainIndex(pc, (pc) => {
    const classKey = getClassKey(pathKey, pc.name);
    database.PathClasses.set(pathKey, classKey);
    database.ParsedClasses.set(classKey, pc);
  });
}

export async function RescanSourceCode(): Promise<PathDatabase> {
  ResetDatabase();
  const teamPaths = await GetTeamPaths();
  for (const [team, pki] of teamPaths) {
    for (const pathKey of pki) {
      const path = PathFromKey(pathKey);
      const pci = await GetPathChainIndex(team, path);
      if (!isError(pci)) {
        RegisterTopLevelParsedClass(team, path, pci);
      }
    }
  }
  database.HasFieldImage = await CheckForFieldImages();
  return GetDatabase();
}

export function GetDatabase(): PathDatabase {
  return database;
}

export function ResetDatabase() {
  database.TeamPaths.clear();
  database.PathClasses.clear();
  database.ParsedClasses.clear();
}

export function ReplaceDatabase(db: PathDatabase) {
  database.TeamPaths = db.TeamPaths;
  database.PathClasses = db.PathClasses;
  database.ParsedClasses = db.ParsedClasses;
}

function GetParsedClassList(team: Team, path: Path): ErrorOr<ClassName[]> {
  const res = database.PathClasses.get(getPathKey(team, path));
  if (isUndefined(res)) {
    return MakeError(`List: ${team}:${path} no Pedro pathing classes found`);
  }
  return [...res.keys()].map(ClassFromKey);
}

// Interfaces to the web server to talk to the web client:

export function WebGetParsedClassRoot(
  team: Team,
  path: Path,
): ErrorOr<ParsedClass> {
  const list = GetParsedClassList(team, path);
  if (isError(list)) {
    return list;
  }
  const shortest = list.reduce((pv, cv) => (pv.length < cv.length ? pv : cv));
  const classKey = getClassKey(getPathKey(team, path), shortest);
  const res = database.ParsedClasses.get(classKey);
  if (isUndefined(res)) {
    return MakeError(`Root: ${team}:${path} no Pedro pathing classes found`);
  }
  return res;
}

// Useful for debugging:
// if (import.meta.main) {
//   PopulateDatabase()
//     .then(() => console.log('done'))
//     .catch(console.error);
// }
