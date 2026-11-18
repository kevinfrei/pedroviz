// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../helpers';
import { PoseRefEditor } from '../Editors/PoseRefEditor';
import { PosesList } from '../Lists/PosesList';
import {
  activeTabAtom,
  DataType,
  selectedItemKeyFamily,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';

// Poses Store Editor
export function PosesView(): ReactElement {
  const [poses, setPoses] = useAtom(symbolTablePosesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Poses));
  const activePose = isUndefined(activeKey) ? undefined : poses.get(activeKey);
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <>
      <PosesList />
      <ItemEditor
        open={!!activePose && activeTab === 'p'}
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
    </>
  );
}
