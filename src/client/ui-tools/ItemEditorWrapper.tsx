// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useId } from 'react';
import { useAtom } from 'jotai';

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
  const [selected, setSelected] = useAtom(selectedItemKeyFamily(type));
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
