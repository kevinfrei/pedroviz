// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../helpers';
import { ItemEditor } from '../Editors/ItemEditorWrapper';
import { PoseRefEditor } from '../Editors/PoseRefEditor';
import {
  activeTabAtom,
  DataType,
  selectedItemKeyFamily,
  symbolTablePosesAtom,
} from '../state/SymbolTable';

// Poses Store Editor
export function PoseEditor(): ReactElement {
  const [poses, setPoses] = useAtom(symbolTablePosesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Poses));
  const activePose = isUndefined(activeKey) ? undefined : poses.get(activeKey);
  const activeTab = useAtomValue(activeTabAtom);
  return (
    <ItemEditor
      open={!!activePose && activeTab === DataType.Poses}
      type={DataType.Poses}
      name={activeKey || ''}
      items={poses}
      setItems={setPoses}>
      <PoseRefEditor
        topLevel
        label="Pose Coordinates & Heading"
        item={activePose!}
        name={activeKey}
        onChange={(updatedPose) => {
          setPoses(NewMapAdd(poses, activeKey!, updatedPose));
        }}
      />
    </ItemEditor>
  );
}
