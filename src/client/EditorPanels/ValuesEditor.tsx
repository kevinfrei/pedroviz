// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';
import { useAtom } from 'jotai';

import { Group, Panel, Separator } from 'react-resizable-panels';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { ValRefControl } from '../ItemEditor/ValRef';
import { ValuesList } from '../ItemLists/ValuesList';
import {
  DataType,
  selectedKeyAtom,
  symbolTableValuesAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

export function ValuesEditor(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Values);
  const activeValue = activeKey && values.get(activeKey);

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
    <Group>
      <Panel>
        <ValuesList />
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activeValue ? (
          <>
            <NameChangeDelete
              title="Selected Value Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <ValRefControl
              label="Value or Reference"
              item={activeValue}
              name={activeKey}
              onChange={(newVal) =>
                setValues(NewMapAdd(values, activeKey, newVal))
              }
            />
          </>
        ) : (
          <div>Select or create a value to edit.</div>
        )}
      </Panel>
    </Group>
  );
}
