// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { focusAtom } from 'jotai-optics';
import { atomWithStorage, unwrap } from 'jotai/utils';

import { isDefined, isUndefined } from '@freik/typechk';

import { NamedValues, SymbolTable } from '../../dataTypes';
import { NewMapAdd, NewMapDelete } from '../../helpers';
import { EMPTY_SYMBOL_TABLE, SAMPLE_AUTONOMOUS_PRESET } from '../Constants';
import { CorrectPathsAtom, SelectedPathsAtom } from './UserCode';

export const DataType = Object.freeze({
  Values: 0,
  Poses: 1,
  Curves: 2,
  Interpolations: 3,
  Paths: 4,
} as const);
export type DataType = (typeof DataType)[keyof typeof DataType];
export type SelectedKey = Map<DataType, string>;
export const DataTypeNames = Object.freeze([
  'Value',
  'Pose',
  'Curve',
  'Interpolation',
  'Path',
]);

const maybeSymbolTableAtom = unwrap(CorrectPathsAtom);
export const symbolTableAtom = atom(
  (get) => {
    const mst = get(maybeSymbolTableAtom);
    return mst || EMPTY_SYMBOL_TABLE;
  },
  (_, set, val: SymbolTable) => {
    const nv: NamedValues = {
      values: MapToRecord(val.values),
      poses: MapToRecord(val.poses),
      interpolations: MapToRecord(val.interpolations),
      curves: MapToRecord(val.curves),
      paths: MapToRecord(val.paths),
    };
    console.log(
      'Symbol Table update',
      val.values.size,
      val.poses.size,
      val.interpolations.size,
      val.curves.size,
      val.paths.size,
    );
    set(SelectedPathsAtom, nv);
  },
);
export const symbolTableValuesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('values'),
);
export const symbolTablePosesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('poses'),
);
export const symbolTableInterpolationsAtom = focusAtom(
  symbolTableAtom,
  (optic) => optic.prop('interpolations'),
);
export const symbolTableCurvesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('curves'),
);
export const symbolTablePathsAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('paths'),
);
export const selectedKeyAtom = atom<SelectedKey>(new Map());
export const selectedItemKeyFamily = atomFamily((type: DataType) =>
  atom(
    (get) => {
      return get(selectedKeyAtom).get(type);
    },
    (get, set, value: string | undefined) => {
      const sel = get(selectedKeyAtom);
      const newMap = isUndefined(value)
        ? NewMapDelete(sel, type)
        : NewMapAdd(sel, type, value);
      if (isDefined(newMap)) {
        set(selectedKeyAtom, newMap);
      }
    },
  ),
);
export const selectedPathOrCurveKeyAtom = atom((get) => {
  const selPath = get(selectedItemKeyFamily(DataType.Paths));
  if (selPath) {
    return selPath;
  }
  const selCurve = get(selectedItemKeyFamily(DataType.Curves));
  return isDefined(selCurve) ? selCurve : undefined;
});

export const activeTabAtom = atomWithStorage<string>(
  'activeTab',
  'v',
  undefined,
  { getOnInit: true },
);

/*export*/ function MapToRecord<T>(map: Map<string, T>): Record<string, T> {
  const res: Record<string, T> = {};
  map.forEach((val, key) => {
    res[key] = val;
  });
  return res;
}

export const namedValuesAtom = atom<Promise<NamedValues>>(async (get) => {
  const symbolTable = await get(symbolTableAtom);
  return {
    values: MapToRecord(symbolTable.values),
    poses: MapToRecord(symbolTable.poses),
    interpolations: MapToRecord(symbolTable.interpolations),
    curves: MapToRecord(symbolTable.curves),
    paths: MapToRecord(symbolTable.paths),
  };
});
