// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useId } from 'react';
import { useAtom } from 'node_modules/jotai/dist';

import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Input,
  Label,
  makeStyles,
  OverlayDrawer,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@fluentui/react-components';
import { DeleteRegular, Dismiss24Regular } from '@fluentui/react-icons';
import { NewMapAdd, NewMapDelete, NewMapRename } from 'src/DataTypeChecks';

import { DataType, DataTypeNames, selectedKeyAtom } from '../state/SymbolTable';
import { useToast } from './NotificationToast';

const useStyles = makeStyles({
  toolbar: {
    justifyContent: 'space-between',
  },
});

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
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const setToast = useToast();

  const typeName = DataTypeNames[type];
  const setOpen = (open: boolean) => {
    if (!open) {
      const res = NewMapDelete(selected, type);
      if (res) {
        setSelected(res);
      }
    }
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(items, oldKey, newKey);
    if (newMap) {
      setItems(newMap);
      setSelected(NewMapAdd(selected, type, newKey));
      setToast(`Renamed ${typeName} "${oldKey}" to "${newKey}"`);
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(items, keyToDelete);
    if (newMap) {
      setItems(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, type, remaining[0]!)
        : NewMapDelete(selected, type);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted ${typeName} "${keyToDelete}"`);
    } else {
      setToast(`Failed to delete ${typeName} "${keyToDelete}"`, 'error');
    }
  };

  return (
    <OverlayDrawer
      style={{ zIndex: 100, width: '350px' }}
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
