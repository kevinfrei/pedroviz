// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useId } from 'react';
import { useSetAtom } from 'jotai';

import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Input,
  Label,
  makeStyles,
  OverlayDrawer,
  tokens,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@fluentui/react-components';
import { DeleteRegular, Dismiss24Regular } from '@fluentui/react-icons';
import { isDefined, isUndefined } from '@freik/typechk';

import { chkRef, CurveRef, Path, SymbolTable } from '../../dataTypes';
import { NewMapDelete, NewMapRename } from '../../helpers';
import {
  DataType,
  DataTypeNames,
  selectedItemKeyFamily,
} from '../state/SymbolTable';
import { useToast } from './NotificationToast';

const useStyles = makeStyles({
  toolbar: {
    justifyContent: 'space-between',
  },
});

// Walk the whole tree updating refs to the renamed item
function FullRenameItem(
  type: DataType,
  oldName: string,
  newName: string,
  symbolTable: SymbolTable,
): SymbolTable | undefined {
  // Handle renames of all data types, because why not...
  if (type === DataType.Paths) {
    // Paths are trivial...
    const paths = NewMapRename(symbolTable.paths, oldName, newName);
    if (isDefined(paths)) {
      return { ...symbolTable, paths };
    }
  }
  if (type === DataType.Curves) {
    // Curves require attention to other curves, and all paths for possible references
    const curves = NewMapRename(symbolTable.curves, oldName, newName);
    if (isUndefined(curves)) {
      return undefined;
    }
    for (const cr of curves) {
      if (chkRef(cr) && cr.ref === oldName) {
        cr.ref = newName;
      }
    }
    let paths: Map<string, Path> | undefined = undefined;
    for (const [name, path] of symbolTable.paths) {
      const toSet: number[] = [];
      for (let i = 0; i < path.curves.length; i++) {
        const cr = path.curves[i];
        if (chkRef(cr) && cr.ref === oldName) {
          toSet.push(i);
        }
      }
      if (toSet.length > 0) {
        const curves: CurveRef[] = [...path.curves];
        toSet.forEach((i) => {
          curves[i] = { ref: newName };
        });
        if (isUndefined(paths)) {
          paths = new Map(symbolTable.paths);
        }
        paths.set(name, { ...path, curves });
      }
    }
    return isUndefined(paths)
      ? { ...symbolTable, curves }
      : { ...symbolTable, curves, paths };
  }
  return undefined;
}

export type ItemEditorProps<T> = {
  name: string;
  items: Map<string, T>;
  setItems: (newItems: Map<string, T>) => void;
  children: ReactElement | ReactElement[];
  type: DataType;
  open: boolean;
};

export function ItemEditor<T>({
  name,
  items,
  setItems,
  children,
  type,
  open,
}: ItemEditorProps<T>): ReactElement {
  const id = useId();
  const toolbarStyle = useStyles();
  const setSelected = useSetAtom(selectedItemKeyFamily(type));
  const setToast = useToast();

  const typeName = DataTypeNames[type];
  const setOpen = (open: boolean) => {
    if (!open) {
      setSelected(undefined);
    }
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(items, oldKey, newKey);
    if (newMap) {
      setItems(newMap);
      setSelected(newKey);
      setToast(`Renamed ${typeName} "${oldKey}" to "${newKey}"`);
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(items, keyToDelete);
    if (newMap) {
      setItems(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected(remaining[0]);
      setToast(`Deleted ${typeName} "${keyToDelete}"`);
    } else {
      setToast(`Failed to delete ${typeName} "${keyToDelete}"`, 'error');
    }
  };

  return (
    <OverlayDrawer
      style={{
        zIndex: 100,
        width: '375px',
        backgroundColor: tokens.colorNeutralBackground3,
      }}
      open={open}
      modalType="non-modal"
      backdropMotion={null}
      surfaceMotion={null}
      position="end"
      onOpenChange={(_, { open }) => setOpen(open)}>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={() => setOpen(false)}
            />
          }>
          {typeName} Editor
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <Toolbar className={toolbarStyle.toolbar}>
          <ToolbarGroup>
            <Label htmlFor={id}>Name&nbsp;</Label>
            <Input
              id={id}
              type="text"
              defaultValue={name}
              key={name}
              onBlur={(e) => handleRename(name, e.target.value.trim())}
            />
          </ToolbarGroup>
          <ToolbarButton
            icon={<DeleteRegular />}
            onClick={() => handleDelete(name)}
            title={`Delete ${name}`}
          />
        </Toolbar>
        {children}
      </DrawerBody>
    </OverlayDrawer>
  );
}
