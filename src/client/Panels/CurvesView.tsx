// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../DataTypeChecks';
import { CurveRef } from '../../DataTypes';
import { CurveRefEditor } from '../Editors/CurveRefEditor';
import { CurvesList } from '../Lists/CurvesList';
import {
  DataType,
  selectedItemKeyFamily,
  symbolTableCurvesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';

// Curves Store Editor
export function CurvesView(): ReactElement {
  const [curves, setCurves] = useAtom(symbolTableCurvesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Curves));
  const activeCurve = isUndefined(activeKey)
    ? undefined
    : curves.get(activeKey);

  return (
    <>
      <CurvesList />
      <ItemEditor
        open={!!activeCurve}
        name={activeKey || ''}
        type={DataType.Curves}
        items={curves}
        setItems={setCurves}>
        <CurveRefEditor
          label="Curve Definition"
          item={activeCurve as CurveRef}
          name={activeKey}
          onChange={(updatedCurve: CurveRef) => {
            setCurves(
              NewMapAdd(curves, activeKey, updatedCurve) as Map<
                string,
                CurveRef
              >,
            );
          }}
        />
      </ItemEditor>
    </>
  );
}
