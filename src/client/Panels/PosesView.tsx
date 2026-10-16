// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { PoseRefEditor } from '../Editors/PoseRefEditor';
import { PosesList } from '../Lists/PosesList';
import {
  DataType,
  selectedKeyAtom,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';
import { useToast } from '../ui-tools/NotificationToast';

// Poses Store Editor
export function PosesView(): ReactElement {
  const [poses, setPoses] = useAtom(symbolTablePosesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Poses);
  const activePose = isUndefined(activeKey) ? undefined : poses.get(activeKey);

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
    <>
      <PosesList />
      <ItemEditor
        open={!!activePose}
        type={DataType.Poses}
        name={activeKey || ''}
        handleRename={handleRename}
        handleDelete={handleDelete}>
        <PoseRefEditor
          label="Pose Coordinates & Heading"
          item={activePose!}
          name={activeKey}
          onChange={(updatedPose) => {
            setPoses(NewMapAdd(poses, activeKey!, updatedPose));
            setToast(`Updated pose "${activeKey}"`);
          }}
        />
      </ItemEditor>
    </>
  );
}
