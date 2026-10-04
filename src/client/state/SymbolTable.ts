// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { atomWithStorage } from 'jotai/utils';

import { SAMPLE_AUTONOMOUS_PRESET } from '../constants';
import { SymbolTable } from '../dto_schema';

type FieldOptions = 'values' | 'poses' | 'interpolations' | 'curves' | 'paths';
type SelectedKey = { store: FieldOptions; key: string };

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
export const selectedKeyAtom = atom<SelectedKey>({
  store: 'values',
  key: 'startX',
});
export const activeTabAtom = atomWithStorage<string>(
  'activeTab',
  'v',
  undefined,
  { getOnInit: true },
);
