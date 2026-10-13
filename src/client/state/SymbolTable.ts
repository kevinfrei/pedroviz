// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { atomWithStorage } from 'jotai/utils';

import { SymbolTable } from '../../DataTypes';
import { SAMPLE_AUTONOMOUS_PRESET } from '../constants';

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

export const symbolTableAtom = atom<SymbolTable>(SAMPLE_AUTONOMOUS_PRESET);
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
export const activeTabAtom = atomWithStorage<string>(
  'activeTab',
  'v',
  undefined,
  { getOnInit: true },
);
