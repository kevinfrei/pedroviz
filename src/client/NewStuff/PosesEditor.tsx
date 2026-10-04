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
import { NewMapAdd, NewMapDelete, NewMapRename } from './dto_schema';
import { useToast } from './NotificationToast';
import { PoseRefControl, PoseRefInline } from './PoseRefs';
import { resolvePoseRef } from './Resolvers';
import {
  searchFilterAtom,
  selectedKeyAtom,
  symbolTableAtom,
  symbolTablePosesAtom,
} from './state';

// Poses Store Editor
export function PosesEditor(): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const [poses, setPoses] = useAtom(symbolTablePosesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();

  const lsearch = search.toLowerCase();
  const keys = Array.from(poses.keys()).filter((k) =>
    k.toLowerCase().includes(lsearch),
  );

  const activeKey = selected.store === 'poses' ? selected.key : keys[0] || '';
  const activePose = poses.get(activeKey);

  const handleAdd = () => {
    let count = 1;
    while (poses.has(`newPose${count}`)) count++;
    const newKey = `newPose${count}`;
    setPoses(
      NewMapAdd(poses, newKey, {
        X: { val: 0 },
        Y: { val: 0 },
        Heading: { val: 0 },
        inRadians: false,
      }),
    );
    setSelected({ store: 'poses', key: newKey });
    setToast(`Added pose "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(poses, oldKey, newKey);
    if (newMap) {
      setPoses(newMap);
      setSelected({ store: 'poses', key: newKey });
      setToast(`Renamed pose "${oldKey}" to "${newKey}"`);
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(poses, keyToDelete);
    if (newMap) {
      setPoses(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected({ store: 'poses', key: remaining[0] || '' });
      setToast(`Deleted pose "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Poses ({poses.size})</Text>
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
                  <span>{k}</span>&nbsp;
                  <PoseRefInline poseref={poses.get(k)} />
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
                setPoses(NewMapAdd(poses, activeKey, updatedPose));
                setToast(`Updated pose "${activeKey}"`);
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
