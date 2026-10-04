import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { NewMapAdd, NewMapDelete, NewMapRename } from './dto_schema';
import { useToast } from './NotificationToast';
import {
  searchFilterAtom,
  selectedKeyAtom,
  symbolTableValuesAtom,
} from './state';
import { ValRefControl, ValRefInline } from './ValRefs';

// Values Editor
export function ValuesEditor(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();
  const keys = Array.from(values.keys()).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'values' ? selected.key : keys[0] || '';
  const activeValue = values.get(activeKey);

  const handleAdd = () => {
    let count = 1;
    while (values.has(`newValue${count}`)) count++;
    const newKey = `newValue${count}`;

    setValues(NewMapAdd(values, newKey, { val: 0.0 }));
    setSelected({ store: 'values', key: newKey });
    setToast(`Added value "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(values, oldKey, newKey);
    if (newMap) {
      setValues(newMap);
      setSelected({ store: 'values', key: newKey });
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(values, keyToDelete);
    if (newMap) {
      setValues(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected({ store: 'values', key: remaining[0] || '' });
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
          placeholder="Filter Values by name"
          onChange={(_, d) => setSearch(d.value)}
        />

        <div>
          {keys.length === 0 ? (
            <Text>No values found.</Text>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'values', key: k })}>
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
