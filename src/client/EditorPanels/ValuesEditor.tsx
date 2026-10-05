// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';
import { useAtom } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../dto_schema';
import { ValRefControl, ValRefInline } from '../ItemEditor/ValRefs';
import {
  DataType,
  selectedKeyAtom,
  symbolTableValuesAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

// Values Editor
export function ValuesEditor(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');
  const setToast = useToast();
  const keys = Array.from(values.keys()).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.get(DataType.Values) || keys[0] || '';
  const activeValue = values.get(activeKey);

  const handleAdd = () => {
    let count = 1;
    while (values.has(`newValue${count}`)) count++;
    const newKey = `newValue${count}`;

    setValues(NewMapAdd(values, newKey, { val: 0.0 }));
    setSelected(NewMapAdd(selected, DataType.Values, newKey));
    setToast(`Added value "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(values, oldKey, newKey);
    if (newMap) {
      setValues(newMap);
      setSelected(NewMapAdd(selected, DataType.Values, newKey));
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
        <Toolbar>
          <Text>Values ({values.size})</Text>
          <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
            Create Value
          </ToolbarButton>
        </Toolbar>

        <Input
          type="text"
          contentBefore={<SearchRegular />}
          value={search}
          placeholder="Search Values"
          onChange={(_, d) => setSearch(d.value)}
        />

        <div>
          {keys.length === 0 ? (
            <Text>No values found.</Text>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() =>
                  setSelected(NewMapAdd(selected, DataType.Values, k))
                }>
                <span>{k}</span>&nbsp;
                <ValRefInline valref={values.get(k)} />
              </div>
            ))
          )}
        </div>
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
              value={activeValue}
              ref={activeKey}
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
