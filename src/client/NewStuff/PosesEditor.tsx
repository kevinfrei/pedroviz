import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import {
  Button,
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

import { PoseRefControl, ResolvedPose } from './PoseRefs';
import { resolvePoseRef } from './Resolvers';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  symbolTableAtom,
  toastAtom,
} from './state';

// Poses Store Editor
export function PosesEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const symbolTable = useAtomValue(symbolTableAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const [, setToast] = useAtom(toastAtom);

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
                  onClick={() => setSelected({ store: 'poses', key: k })}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                    activeKey === k
                      ? 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-semibold'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                  <span className="truncate">{k}</span>
                  <span className="font-mono text-neutral-500 dark:text-neutral-400">
                    <ResolvedPose pose={res} />
                  </span>
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
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={activeKey}
                  key={activeKey}
                  onBlur={(e) => handleRename(activeKey, e.target.value.trim())}
                  className="font-bold text-lg text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-dashed border-neutral-400 focus:border-sky-500 outline-none px-1"
                />
                <span className="text-xs text-neutral-400 font-mono">
                  (Pose Key)
                </span>
              </div>
              <Button
                onClick={() => handleDelete(activeKey)}
                icon={<DeleteRegular />}
                title="Delete Pose"
              />
            </div>

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
