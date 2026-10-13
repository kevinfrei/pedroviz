// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Text } from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { NewMapAdd, NewMapDelete, NewMapRename } from '../../DataTypeChecks';
import { CurveRef } from '../../DataTypes';
import { CurveRefControl } from '../Editors/CurveRef';
import { CurvesList } from '../Lists/Curves';
import {
  DataType,
  selectedKeyAtom,
  symbolTableCurvesAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

// Curves Store Editor
export function CurvesEditor(): ReactElement {
  const [curves, setCurves] = useAtom(symbolTableCurvesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const activeKey = selected.get(DataType.Curves);
  const activeCurve = activeKey && curves.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(curves, oldKey, newKey);
    if (newMap) {
      setCurves(newMap);
      setSelected(NewMapAdd(selected, DataType.Curves, newKey));
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(curves, keyToDelete);
    if (newMap) {
      setCurves(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Curves, remaining[0]!)
        : NewMapDelete(selected, DataType.Curves);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted curve "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <CurvesList />
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activeCurve ? (
          <>
            <NameChangeDelete
              title="Selected Curve Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <CurveRefControl
              label="Curve Definition"
              item={activeCurve}
              name={activeKey}
              onChange={(updatedCurve: CurveRef) => {
                setCurves(NewMapAdd(curves, activeKey, updatedCurve));
              }}
            />
          </>
        ) : (
          <Text>Select or create a curve to edit.</Text>
        )}
      </Panel>
    </Group>
  );
}
