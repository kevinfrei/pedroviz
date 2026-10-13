// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { PoseRefControl } from '../ItemEditor/PoseRef';
import { PosesList } from '../ItemLists/PosesList';
import {
  DataType,
  selectedKeyAtom,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

// Poses Store Editor
export function PosesEditor(): ReactElement {
  const [poses, setPoses] = useAtom(symbolTablePosesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Poses);
  const activePose = activeKey && poses.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(poses, oldKey, newKey);
    if (newMap) {
      setPoses(newMap);
      setSelected(NewMapAdd(selected, DataType.Poses, newKey));
      setToast(`Renamed pose "${oldKey}" to "${newKey}"`);
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(poses, keyToDelete);
    if (newMap) {
      setPoses(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Poses, remaining[0]!)
        : NewMapDelete(selected, DataType.Poses);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted pose "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <PosesList />
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
              item={activePose}
              name={activeKey}
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
