import { ReactElement } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from './NotificationToast';
import { PoseRefControl, PoseRefInline } from './PoseRefs';
import { resolvePoseRef } from './Resolvers';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  symbolTableAtom,
} from './state';

// Poses Store Editor
export function PosesEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const symbolTable = useAtomValue(symbolTableAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();

  const poses = namedValues.poses || {};
  const keys = Object.keys(poses).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'poses' ? selected.key : keys[0] || '';
  const activePose = poses[activeKey];

  const handleAdd = () => {
    let baseName = 'newPose';
    let count = 1;
    while (poses[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      poses: {
        ...poses,
        [newKey]: {
          X: { val: 0 },
          Y: { val: 0 },
          Heading: { val: 0 },
          inRadians: false,
        },
      },
    });
    setSelected({ store: 'poses', key: newKey });
    setToast(`Added pose "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || poses[newKey]) return;
    const oldPose = poses[oldKey];
    if (!oldPose) return;
    const newDict = { ...poses };
    newDict[newKey] = oldPose;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, poses: newDict });
    setSelected({ store: 'poses', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...poses };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, poses: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'poses', key: remaining[0] || '' });
    setToast(`Deleted pose "${keyToDelete}"`);
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Poses ({Object.keys(poses).length})</Text>
          <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
            Create Pose
          </ToolbarButton>
        </Toolbar>

        <Input
          contentBefore={<SearchRegular />}
          type="text"
          placeholder="Filter poses by name"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />

        <div>
          {keys.length === 0 ? (
            <Text>No poses found.</Text>
          ) : (
            keys.map((k) => {
              const res = resolvePoseRef({ ref: k }, symbolTable);
              return (
                <div
                  key={k}
                  onClick={() => setSelected({ store: 'poses', key: k })}>
                  <span>{k}</span>
                  <PoseRefInline poseref={{ ref: k }} />
                </div>
              );
            })
          )}
        </div>
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activePose ? (
          <>
            <NameChangeDelete
              title="Selected Pose Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <PoseRefControl
              label="Pose Coordinates & Heading"
              pose={activePose}
              onChange={(updatedPose) => {
                setNamedValues({
                  ...namedValues,
                  poses: { ...poses, [activeKey]: updatedPose },
                });
              }}
            />
          </>
        ) : (
          <Text>Select or create a pose to edit.</Text>
        )}
      </Panel>
    </Group>
  );
}
