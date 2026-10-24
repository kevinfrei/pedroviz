// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { atomWithRefresh, atomWithStorage } from 'jotai/utils';

import {
  isDefined,
  isError,
  isUndefined,
  Pickle,
  Unpickle,
} from '@freik/typechk';

import { NamedValues, SymbolTable } from '../../dataTypes';
import { RecordToMap } from '../../helpers';
import { PathsFile, Team, TeamList } from '../../ipcTypes';
import { EMPTY_SYMBOL_TABLE } from '../Constants';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import { GetPaths, GetTeams, HasFieldImage, PutPaths } from './API';
import { DisplayOptionsAtom, ThemeAtom } from './SavedSettings';

export const ColorsAtom = atom((get) => {
  const theme = get(ThemeAtom);
  return theme === 'dark' ? lightOnBlack : darkOnWhite;
});
// TODO: Not used any more. I should go back and either do the color coding,
// or remove it...
const ColorForNumber = atomFamily((index: number) =>
  atom((get) => {
    const colors = get(ColorsAtom);
    return colors[index % colors.length];
  }),
);

// The cache helps debugging sometimes...
let teamsCache: TeamList | null = null;
export const TeamsAtom = atomWithRefresh(async () => {
  teamsCache = await GetTeams();
  return teamsCache;
});

let validCache: TeamList | null = null;
export const TeamsWithFilesAtom = atomWithRefresh(async () => {
  validCache = await GetTeams();
  return validCache;
});

export const TeamsWithoutFilesAtom = atom(async (get) => {
  const teams = new Set(await get(TeamsAtom));
  const withFiles = new Set(await get(TeamsWithFilesAtom));
  return [...teams.difference(withFiles)];
});

export const HasFieldImageAtom = atomWithRefresh(async (get) => {
  return await HasFieldImage();
});

const SelectedTeamBacking = atomWithStorage<Team | undefined>(
  'selectedTeam',
  '' as Team,
  undefined,
  { getOnInit: true },
);
export const SelectedTeamAtom = atom(
  async (get) => {
    const allTeams = await get(TeamsAtom);
    if (allTeams.length === 1) {
      return allTeams[0];
    }
    return get(SelectedTeamBacking);
  },
  (get, set, val: string | Team) => {
    const cur = get(SelectedTeamBacking);
    // Clear the selected file when the team is changed
    if (cur !== val) {
      set(SelectedTeamBacking, val as Team);
    }
  },
);

const pathsFileBackingFamily = atomFamily((team: Team) =>
  atom<PathsFile | null>(null),
);

const pathsFileFamily = atomFamily((team: Team) =>
  atomWithRefresh(
    async (get) => {
      const backer = get(pathsFileBackingFamily(team));
      if (backer !== null) {
        console.log('pathsFileFamily backer', team);
        return backer;
      }
      const pathsFile = await GetPaths(team);
      console.log('pathsFileFamily getter IPC', team);
      return pathsFile;
    },
    (get, set, val: NamedValues) => {
      // TODO: Push the thing to the server
      console.log('pathsFileFamily setter', team, val);
      set(pathsFileBackingFamily(team), val);
    },
  ),
);

export const SelectedPathsAtom = atom(
  async (get): Promise<PathsFile | undefined> => {
    const team = await get(SelectedTeamAtom);
    if (isUndefined(team)) {
      return undefined;
    }
    return await get(pathsFileFamily(team));
  },
  async (get, set, val: NamedValues) => {
    const team = await get(SelectedTeamAtom);
    if (isDefined(team)) {
      set(pathsFileFamily(team), val);
    }
  },
);

const ErrorsAndCorrectStuff = atom(
  async (get): Promise<[string[], SymbolTable]> => {
    const parsed = await get(SelectedPathsAtom);
    if (isError(parsed) || isUndefined(parsed)) {
      return [
        parsed ? parsed.errors() : ['No symbol table found'],
        Unpickle(Pickle(EMPTY_SYMBOL_TABLE)) as SymbolTable,
      ];
    }
    const res = {
      values: RecordToMap(parsed.values),
      poses: RecordToMap(parsed.poses),
      interpolations: RecordToMap(parsed.interpolations),
      curves: RecordToMap(parsed.curves),
      paths: RecordToMap(parsed.paths),
    };
    return [[], res];
  },
);

export const CorrectPathsAtom = atom(async (get): Promise<SymbolTable> => {
  const [, paths] = await get(ErrorsAndCorrectStuff);
  return paths;
});

export const PathFileErrorsAtom = atom(async (get): Promise<string[]> => {
  const [errors] = await get(ErrorsAndCorrectStuff);
  return errors;
});

export const FocusedPathAtom = atom<string | undefined>(undefined);

export const FieldConfigHashAtom = atom((get) => {
  const d = get(DisplayOptionsAtom);
  return JSON.stringify(d);
});
