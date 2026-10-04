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

import {
  getInterpType,
  InterpRef,
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
} from '../dto_schema';
import { InterpRefControl } from '../ItemEditor/InterpRefs';
import {
  selectedKeyAtom,
  symbolTableInterpolationsAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

// Interpolators Store Editor
export function InterpolatorsEditor(): ReactElement {
  const [interpolations, setInterpolations] = useAtom(
    symbolTableInterpolationsAtom,
  );
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');
  const setToast = useToast();
  const lsearch = search.toLowerCase();

  const keys = Array.from(interpolations.keys()).filter((k) =>
    k.toLowerCase().includes(lsearch),
  );

  const activeKey =
    selected.store === 'interpolations' ? selected.key : keys[0] || '';
  const activeInterp = interpolations.get(activeKey);

  const handleAdd = () => {
    let count = 1;
    while (interpolations.has(`newInterpolator${count}`)) count++;
    const newKey = `newInterpolator${count}`;

    setInterpolations(NewMapAdd(interpolations, newKey, { reversed: false }));
    setSelected({ store: 'interpolations', key: newKey });
    setToast(`Added interpolator "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(interpolations, oldKey, newKey);
    if (newMap) {
      setInterpolations(newMap);
      setSelected({ store: 'interpolations', key: newKey });
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(interpolations, keyToDelete);
    if (newMap) {
      setInterpolations(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected({ store: 'interpolations', key: remaining[0] || '' });
      setToast(`Deleted interpolator "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Interpolators ({interpolations.size})</Text>
          <ToolbarButton icon={<AddRegular />} onClick={handleAdd}>
            Create Interpolator
          </ToolbarButton>
        </Toolbar>

        <Input
          contentBefore={<SearchRegular />}
          type="text"
          placeholder="Filter interpolators by name"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />

        <div>
          {keys.length === 0 ? (
            <div>No interpolators found.</div>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() =>
                  setSelected({ store: 'interpolations', key: k })
                }>
                <Text>{k}</Text>&nbsp;
                <Text>{getInterpType(interpolations.get(k)!)}</Text>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activeInterp ? (
          <>
            <NameChangeDelete
              title="Selected Interpolator Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <InterpRefControl
              label="Interpolator Definition"
              interp={activeInterp}
              onChange={(updatedInterp: InterpRef) =>
                setInterpolations(
                  NewMapAdd(interpolations, activeKey, updatedInterp),
                )
              }
            />
          </>
        ) : (
          <Text>Select or create an interpolator to edit.</Text>
        )}
      </Panel>
    </Group>
  );
}
