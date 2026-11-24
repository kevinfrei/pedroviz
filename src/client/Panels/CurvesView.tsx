// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { CurveRef } from '../../dataTypes';
import { NewMapAdd } from '../../helpers';
import { CurveRefEditor } from '../Editors/CurveRefEditor';
import { ItemEditor } from '../Editors/ItemEditorWrapper';
import {
  DataType,
  selectedItemKeyFamily,
  symbolTableCurvesAtom,
} from '../state/SymbolTable';

// Curves Store Editor
export function CurveEditor(): ReactElement {
  const [curves, setCurves] = useAtom(symbolTableCurvesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Curves));
  const activeCurve = isUndefined(activeKey)
    ? undefined
    : curves.get(activeKey);

  return (
    <ItemEditor
      name={activeKey || ''}
      type={DataType.Curves}
      items={curves}
      setItems={setCurves}>
      <CurveRefEditor
        topLevel
        label="Curve Definition"
        item={activeCurve as CurveRef}
        name={activeKey}
        onChange={(updatedCurve: CurveRef) => {
          setCurves(
            NewMapAdd(curves, activeKey, updatedCurve) as Map<string, CurveRef>,
          );
        }}
      />
    </ItemEditor>
  );
}
