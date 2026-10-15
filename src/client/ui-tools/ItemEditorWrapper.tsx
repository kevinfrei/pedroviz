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
import { NewMapDelete } from 'src/DataTypeChecks';

import { DataType, DataTypeNames, selectedKeyAtom } from '../state/SymbolTable';

const useStyles = makeStyles({
  toolbar: {
    justifyContent: 'space-between',
  },
});

export type ItemEditorProps = {
  name: string;
  handleRename: (oldName: string, newName: string) => void;
  handleDelete: (name: string) => void;
  children: ReactElement | ReactElement[];
  type: DataType;
  open: boolean;
};

export function ItemEditor({
  name,
  handleRename,
  handleDelete,
  children,
  type,
  open,
}: ItemEditorProps): ReactElement {
  const id = useId();
  const toolbarStyle = useStyles();
  const [selected, setSelected] = useAtom(selectedKeyAtom);

  const typeName = DataTypeNames[type];
  const setOpen = (open: boolean) => {
    if (!open) {
      const res = NewMapDelete(selected, type);
      if (res) {
        setSelected(res);
      }
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
