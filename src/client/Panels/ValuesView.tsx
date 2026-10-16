// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { ValRefEditor } from '../Editors/ValRefEditor';
import { ValuesList } from '../Lists/ValuesList';
import {
  DataType,
  selectedKeyAtom,
  symbolTableValuesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';
import { useToast } from '../ui-tools/NotificationToast';

export function ValuesView(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Values);
  const activeValue = isUndefined(activeKey)
    ? undefined
    : values.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(values, oldKey, newKey);
    if (newMap) {
      setValues(newMap);
      setSelected(NewMapAdd(selected, DataType.Values, newKey));
      setToast(`Renamed value "${oldKey}" to "${newKey}"`);
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(values, keyToDelete);
    if (newMap) {
      setValues(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Values, remaining[0]!)
        : NewMapDelete(selected, DataType.Values);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted value "${keyToDelete}"`, 'success');
    }
  };

  return (
    <>
      <ValuesList />
      <ItemEditor
        open={!!activeValue}
        type={DataType.Values}
        name={activeKey || ''}
        handleRename={handleRename}
        handleDelete={handleDelete}>
        <ValRefEditor
          label="Value or Reference"
          item={activeValue!}
          name={activeKey}
          onChange={(newVal) =>
            setValues(NewMapAdd(values, activeKey!, newVal))
          }
        />
      </ItemEditor>
    </>
  );
}
