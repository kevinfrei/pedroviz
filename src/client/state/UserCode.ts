// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { focusAtom } from 'jotai-optics';
import {
  atomWithRefresh,
  atomWithStorage,
  selectAtom,
  unwrap,
} from 'jotai/utils';

import { ErrorOr, isError } from '@freik/typechk';

import { MakeEmptyParsedClass } from '../../CodeTypeCheck';
import {
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  ParsedClass,
  PoseName,
  PoseRef,
  ValueName,
} from '../../CodeTypes';
import {
  ClassFromKey,
  getClassKey,
  getPathKey,
  PathFromKey,
} from '../../IpcTypeCheck';
import {
  ClassKey,
  ClassName,
  Path,
  PathDatabase,
  PathKey,
  Team,
} from '../../IpcTypes';
import { OneFileIndex } from '../types';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import { GetFullDb, LoadAndIndexFile, PutFullDb, UpdateIndexFile } from './API';
import { EmptyMappedFile, GetNameLookup } from './IndexedFile';
import { DisplayOptionsAtom, ThemeAtom } from './SavedSettings';

export const CreationSupportedAtom = atom(false);
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

export const BlurAtom = atom('');
let dbCache: PathDatabase | null = null;
export const FullDatabaseAtom = atomWithRefresh(
  async () => {
    dbCache = await GetFullDb();
    return dbCache;
  },
  async (get, set, val: PathDatabase) => {
    await PutFullDb(val);
  },
);

const IndexedDatabaseAtom = atomWithRefresh(
  async (get) => {
    const db = await get(FullDatabaseAtom);
    const index = GetNameLookup();
    index.setDb(db);
    return index;
  } /*
  async (get, set, val: NameLookup) => {
    // TODO: This ain't done, not in the least
    console.error('NYI: IndexedDatabaseAtom set');
    const db = await get(FullDatabaseAtom);
  },*/,
);

/*export*/ function ClearCache() {
  dbCache = null;
}

const TeamPathsAtom = selectAtom(
  FullDatabaseAtom,
  async (db) => (await db).TeamPaths,
);
const PathClassesAtom = selectAtom(
  FullDatabaseAtom,
  async (db) => (await db).PathClasses,
);
const ParsedClassesAtom = selectAtom(
  FullDatabaseAtom,
  async (db) => (await db).ParsedClasses,
);
export const HasExternalFieldAtom = selectAtom(
  FullDatabaseAtom,
  async (db) => (await db).HasFieldImage,
);

export const TeamsAtom = atom(async (get): Promise<Team[]> => {
  const tp = await get(TeamPathsAtom);
  return [...tp.keys()];
});

const PathKeysForTeamFamily = atomFamily((team: Team) =>
  atom(async (get): Promise<Set<PathKey>> => {
    return (await get(TeamPathsAtom)).get(team) || new Set();
  }),
);

const PathsForTeamFamily = atomFamily((team: Team) =>
  atom(async (get): Promise<Path[]> => {
    return [...(await get(PathKeysForTeamFamily(team))).keys()].map(
      PathFromKey,
    );
  }),
);

const ClassKeysForPathKeyFamily = atomFamily((pk: PathKey) =>
  atom(async (get): Promise<Set<ClassKey>> => {
    return (await get(PathClassesAtom)).get(pk) || new Set();
  }),
);

const ClassesForPathKeyFamily = atomFamily((pk: PathKey) =>
  atom(async (get): Promise<ClassName[]> => {
    return [...(await get(ClassKeysForPathKeyFamily(pk))).keys()].map(
      ClassFromKey,
    );
  }),
);

const PathKeysForSelectedTeamAtom = atom(async (get): Promise<Set<PathKey>> => {
  const selTeam = await get(SelectedTeamAtom);
  return await get(PathKeysForTeamFamily(selTeam));
});

export const PathsForSelectedTeamAtom = atom(async (get): Promise<Path[]> => {
  const selTeam = await get(SelectedTeamAtom);
  return await get(PathsForTeamFamily(selTeam));
});

const ClassKeysForSelectedPathAtom = atom(
  async (get): Promise<Set<ClassKey>> => {
    const pathKey = await get(SelectedPathKeyAtom);
    return get(ClassKeysForPathKeyFamily(pathKey));
  },
);

const SelectedTeamBacking = atomWithStorage<Team>(
  'selectedTeam',
  '' as Team,
  undefined,
  { getOnInit: true },
);

export const SelectedTeamAtom = atom(
  async (get) => {
    const allTeams = await get(TeamsAtom);
    if (allTeams.length === 1) {
      return allTeams[0] as Team;
    }
    return get(SelectedTeamBacking);
  },
  (get, set, val: string | Team) => {
    const cur = get(SelectedTeamBacking);
    // Clear the selected file when the team is changed
    if (cur !== val) {
      set(SelectedPathAtom, '' as Path);
      set(SelectedTeamBacking, val as Team);
    }
  },
);

const SelectedPathKeyBacking = atomWithStorage<PathKey>(
  'selectedPathKey',
  '' as PathKey,
  undefined,
  { getOnInit: true },
);

const SelectedPathKeyAtom = atom(
  async (get) => {
    const selPath = await get(SelectedPathKeyBacking);
    const selTeam = await get(SelectedTeamAtom);
    if (selTeam === '') {
      return '' as PathKey;
    }
    const pathsForTeam = await get(PathKeysForSelectedTeamAtom);
    if (pathsForTeam.size === 1) {
      return [...pathsForTeam.keys()][0]! as PathKey;
    }
    return selPath as PathKey;
  },
  (get, set, val: PathKey) => {
    const pathKey = get(SelectedPathKeyBacking);
    // Clear the selected class when the file is changed
    if (pathKey !== val) {
      set(SelectedClassAtom, '' as ClassName);
      set(SelectedPathKeyBacking, val as PathKey);
    }
  },
);

export const SelectedPathAtom = atom(
  async (get) => PathFromKey(await get(SelectedPathKeyAtom)),
  async (get, set, val: Path | string) => {
    const team = await get(SelectedTeamAtom);
    const curKey = await get(SelectedPathKeyAtom);
    const key = getPathKey(team, val as Path);
    // Clear the selected class when the file is changed
    if (key !== curKey) {
      set(SelectedClassAtom, '' as ClassName);
      set(SelectedPathKeyBacking, key);
    }
  },
);

export const ClassesForSelectedPathAtom = atom(
  async (get): Promise<ClassName[]> => {
    const key = await get(SelectedPathKeyAtom);
    return await get(ClassesForPathKeyFamily(key));
  },
);

const SelectedClassKeyBacking = atomWithStorage(
  'selectedClass',
  '' as ClassKey,
  undefined,
  { getOnInit: true },
);

const SelectedClassKeyAtom = atom(
  async (get) => {
    const selClass = await get(SelectedClassKeyBacking);
    const selPath = await get(SelectedPathAtom);
    if (selPath === '') {
      return '' as ClassKey;
    }
    const classesForPath = await get(ClassKeysForSelectedPathAtom);
    if (classesForPath.size === 1) {
      return [...classesForPath.keys()][0]! as ClassKey;
    }
    return selClass;
  },
  (get, set, val: ClassKey) => {
    const classKey = get(SelectedClassKeyBacking);
    // Clear the selected class when the file is changed
    if (classKey !== val) {
      set(SelectedClassKeyBacking, val as ClassKey);
    }
  },
);

export const SelectedClassAtom = atom(
  async (get) => ClassFromKey(await get(SelectedClassKeyAtom)),
  async (get, set, val: ClassName | string) => {
    const pathKey = await get(SelectedPathKeyAtom);
    const classKey = getClassKey(pathKey, val);
    const curSel = await get(SelectedClassKeyAtom);
    if (classKey != curSel) {
      set(SelectedClassKeyAtom, classKey);
    }
  },
);

export const SelectedParsedClassAtom = atom(
  async (get): Promise<ParsedClass> => {
    const key = await get(SelectedClassKeyAtom);
    const classes = await get(ParsedClassesAtom);
    return classes.size
      ? classes.get(key) || MakeEmptyParsedClass()
      : MakeEmptyParsedClass();
  },
);

const UnwrappedParsedClass = unwrap(SelectedParsedClassAtom, () =>
  MakeEmptyParsedClass(),
);

export const UnmatchedFieldsAtom = selectAtom(
  UnwrappedParsedClass,
  (pc) => pc.unmatchedFields,
);
export const ParsingErrorsAtom = selectAtom(
  UnwrappedParsedClass,
  (pc) => pc.parsingErrors,
);

const MappedFileBackingAtom = atom(0);
const MappedFileAtom = atom(
  async (get) => {
    const team = await get(SelectedTeamAtom);
    const file = await get(SelectedPathAtom);
    // const count = get(MappedFileBackingAtom);
    // const fullIndex = get(IndexedDatabaseAtom);
    if (team.length > 0 && file.length > 0) {
      const maybeIdx: ErrorOr<OneFileIndex> = await LoadAndIndexFile(
        team,
        file,
      );
      if (!isError(maybeIdx)) {
        return maybeIdx;
      }
      console.error(maybeIdx.errors().join('\n'));
    }
    return EmptyMappedFile;
  },
  async (get, set, data: OneFileIndex | Promise<OneFileIndex>) => {
    const team = await get(SelectedTeamAtom);
    const file = await get(SelectedPathAtom);
    const val = get(MappedFileBackingAtom);
    UpdateIndexFile(team, file, await data);
    set(MappedFileBackingAtom, val + 1);
  },
);

export const NamedValuesAtom = selectAtom(
  UnwrappedParsedClass,
  (pc) => pc.values,
);
export const ValuesLookupAtom = atom((get): Map<ValueName, NamedValue> => {
  const nvs = get(NamedValuesAtom);
  return new Map((nvs || []).map((nv) => [nv.name, nv]));
});

type MapAtom<Str, T> = WritableAtom<Promise<Map<Str, T>>, [Map<Str, T>], void>;

/*
const MappedValuesAtom: MapAtom<ValueName, ValueRef | RadiansRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedValues'),
);
*/
export const NamedPosesAtom = atom(async (get): Promise<NamedPose[]> => {
  const index = await get(SelectedParsedClassAtom);
  return index ? index.poses : [];
});

const MappedPosesAtom: MapAtom<PoseName, PoseRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedPoses'),
);

export const NamedBeziersAtom = atom(async (get): Promise<NamedBezier[]> => {
  const index = await get(SelectedParsedClassAtom);
  return index ? index.beziers : [];
});

export const NamedPathChainsAtom = atom(
  async (get): Promise<NamedPathChain[]> => {
    const index = await get(SelectedParsedClassAtom);
    return index?.pathChains || [];
  },
);
/*
const MappedBeziersAtom: MapAtom<BezierName, BezierRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedBeziers'),
);
*/
function makeItemFromNameFamily<Str, T>(theAtom: MapAtom<Str, T>) {
  return atomFamily((name: Str) =>
    atom(
      async (get) => (await get(theAtom)).get(name),
      async (get, set, val: T) => {
        const mappedItems = new Map(await get(theAtom));
        mappedItems.set(name, val);
        set(theAtom, mappedItems);
      },
    ),
  );
}

// const ValueAtomFamily = makeItemFromNameFamily(MappedValuesAtom);
export const PoseAtomFamily = makeItemFromNameFamily(MappedPosesAtom);

export const FocusedPoseAtom = atom<NamedPose | undefined>(undefined);
export const FocusedCurveAtom = atom<NamedBezier | undefined>(undefined);
export const FocusedPathAtom = atom<NamedPathChain | undefined>(undefined);

export const FieldConfigHashAtom = atom((get) => {
  const d = get(DisplayOptionsAtom);
  const c = get(UnwrappedParsedClass);
  const p = get(FocusedPoseAtom);
  const b = get(FocusedCurveAtom);
  return JSON.stringify({ d, c, p, b });
});
