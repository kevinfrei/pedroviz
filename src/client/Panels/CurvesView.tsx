// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { CurveRef } from '../../DataTypes';
import { CurveRefEditor } from '../Editors/CurveRefEditor';
import { CurvesList } from '../Lists/CurvesList';
import {
  DataType,
  selectedKeyAtom,
  symbolTableCurvesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';
import { useToast } from '../ui-tools/NotificationToast';

// Curves Store Editor
export function CurvesView(): ReactElement {
  const [curves, setCurves] = useAtom(symbolTableCurvesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Curves);
  const activeCurve = isUndefined(activeKey)
    ? undefined
    : curves.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(curves, oldKey, newKey);
    if (newMap) {
      setCurves(newMap);
      setSelected(NewMapAdd(selected, DataType.Curves, newKey));
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(curves, keyToDelete);
    if (newMap) {
      setCurves(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Curves, remaining[0]!)
        : NewMapDelete(selected, DataType.Curves);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted curve "${keyToDelete}"`);
    }
  };

  return (
    <>
      <CurvesList />
      <ItemEditor
        open={!!activeCurve}
        name={activeKey || ''}
        type={DataType.Curves}
        handleRename={handleRename}
        handleDelete={handleDelete}>
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
