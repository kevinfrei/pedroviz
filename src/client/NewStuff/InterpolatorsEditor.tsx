import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  Button,
  Field,
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { getInterpType } from './dto_schema';
import { InterpRefControl } from './InterpRefs';
import { NameChangeDelete } from './NameChangeDelete';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  toastAtom,
} from './state';
import { useWrappedRegionStyle } from './WrappedRegionStyle';

// Interpolators Store Editor
export function InterpolatorsEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const [, setToast] = useAtom(toastAtom);
  const wrappedStyle = useWrappedRegionStyle();

  const interpolations = namedValues.interpolations || {};
  const keys = Object.keys(interpolations).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey =
    selected.store === 'interpolations' ? selected.key : keys[0] || '';
  const activeInterp = interpolations[activeKey];

  const handleAdd = () => {
    let baseName = 'newInterpolator';
    let count = 1;
    while (interpolations[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      interpolations: {
        ...interpolations,
        [newKey]: { reversed: false }, // TangentInterp default
      },
    });
    setSelected({ store: 'interpolations', key: newKey });
    setToast(`Added interpolator "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || interpolations[newKey]) return;
    const oldInterp = interpolations[oldKey];
    if (!oldInterp) return;
    const newDict = { ...interpolations };
    newDict[newKey] = oldInterp;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, interpolations: newDict });
    setSelected({ store: 'interpolations', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...interpolations };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, interpolations: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'interpolations', key: remaining[0] || '' });
    setToast(`Deleted interpolator "${keyToDelete}"`);
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Interpolators ({Object.keys(interpolations).length})</Text>
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
                <Text>{k}</Text>
                <Text>{getInterpType(interpolations[k]!)}</Text>
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
              onChange={(updatedInterp) => {
                setNamedValues({
                  ...namedValues,
                  interpolations: {
                    ...interpolations,
                    [activeKey]: updatedInterp,
                  },
                });
              }}
            />
          </>
        ) : (
          <Text>Select or create an interpolator to edit.</Text>
        )}
      </Panel>
    </Group>
  );
}
