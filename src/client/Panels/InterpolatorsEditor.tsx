// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Text } from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { InterpRef } from '../../DataTypes';
import { InterpRefControl } from '../Editors/InterpRef';
import { InterpolatorsList } from '../Lists/Interpolators';
import {
  DataType,
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
  const setToast = useToast();

  const activeKey = selected.get(DataType.Interpolations);
  const activeInterp = activeKey && interpolations.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(interpolations, oldKey, newKey);
    if (newMap) {
      setInterpolations(newMap);
      setSelected(NewMapAdd(selected, DataType.Interpolations, newKey));
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(interpolations, keyToDelete);
    if (newMap) {
      setInterpolations(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Interpolations, remaining[0]!)
        : NewMapDelete(selected, DataType.Interpolations);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted interpolator "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <InterpolatorsList />
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
              item={activeInterp}
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
