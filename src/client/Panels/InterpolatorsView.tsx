// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { InterpRef } from '../../DataTypes';
import { InterpRefEditor } from '../Editors/InterpRefEditor';
import { InterpolatorsList } from '../Lists/InterpolatorsList';
import {
  DataType,
  selectedKeyAtom,
  symbolTableInterpolationsAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';
import { useToast } from '../ui-tools/NotificationToast';

// Interpolators Store Editor
export function InterpolatorsView(): ReactElement {
  const [interpolations, setInterpolations] = useAtom(
    symbolTableInterpolationsAtom,
  );
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Interpolations);
  const activeInterp = isUndefined(activeKey)
    ? undefined
    : interpolations.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(interpolations, oldKey, newKey);
    if (newMap) {
      setInterpolations(newMap);
      setSelected(NewMapAdd(selected, DataType.Interpolations, newKey));
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(interpolations, keyToDelete);
    if (newMap) {
      setInterpolations(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Interpolations, remaining[0]!)
        : NewMapDelete(selected, DataType.Interpolations);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted interpolator "${keyToDelete}"`);
    }
  };

  return (
    <>
      <InterpolatorsList />
      <ItemEditor
        open={!!activeInterp}
        name={activeKey || ''}
        type={DataType.Interpolations}
        handleRename={handleRename}
        handleDelete={handleDelete}>
        <InterpRefEditor
          label="Interpolator Definition"
          item={activeInterp as InterpRef}
          onChange={(updatedInterp: InterpRef) =>
            setInterpolations(
              NewMapAdd(interpolations, activeKey!, updatedInterp),
            )
          }
        />
      </ItemEditor>
    </>
  );
}
