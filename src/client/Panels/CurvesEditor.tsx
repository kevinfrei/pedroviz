// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';
import { useAtom } from 'jotai';

import {
  DraggableDialog,
  DraggableDialogHandle,
  DraggableDialogSurface,
} from '@fluentui-contrib/react-draggable-dialog';
import {
  Button,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogTitle,
} from '@fluentui/react-components';
import { isUndefined } from 'node_modules/@freik/typechk/lib/esm';

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
  const activeCurve = isUndefined(activeKey)
    ? undefined
    : curves.get(activeKey);

  const setOpen = (open: boolean) => {
    const res = NewMapDelete(selected, DataType.Curves);
    if (res) {
      setSelected(res);
    }
  };
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
    <>
      <CurvesList />
      <DraggableDialog
        open={!!activeCurve}
        modalType="non-modal"
        onOpenChange={(e, data) => setOpen(data.open)}>
        <DraggableDialogSurface>
          <DialogBody>
            <DraggableDialogHandle>
              <DialogTitle>Curve Editor</DialogTitle>
            </DraggableDialogHandle>
            <DialogContent>
              <>
                <NameChangeDelete
                  title="Name"
                  name={activeKey || ''}
                  handleRename={handleRename}
                  handleDelete={handleDelete}
                />
                <CurveRefControl
                  label="Curve Definition"
                  item={activeCurve as CurveRef}
                  name={activeKey}
                  onChange={(updatedCurve: CurveRef) => {
                    setCurves(
                      NewMapAdd(curves, activeKey, updatedCurve) as Map<
                        string,
                        CurveRef
                      >,
                    );
                  }}
                />
              </>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DraggableDialogSurface>
      </DraggableDialog>
    </>
  );
}
