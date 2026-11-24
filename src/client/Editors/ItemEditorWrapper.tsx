// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, ReactNode, useId } from 'react';
import { useSetAtom } from 'jotai';

import {
  Input,
  Label,
  makeStyles,
  Text,
  tokens,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@fluentui/react-components';
import { DeleteRegular, DismissRegular } from '@fluentui/react-icons';

import { NewMapDelete, NewMapRename } from '../../helpers';
import {
  DataType,
  DataTypeNames,
  selectedItemKeyFamily,
} from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';

const useStyles = makeStyles({
  stack: {
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gridTemplateColumns: 'auto',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  toolbar: {
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  editor: {
    overflow: 'auto',
  },
});

export type ItemEditorProps<T> = {
  name: string;
  items: Map<string, T>;
  setItems: (newItems: Map<string, T>) => void;
  children: ReactNode;
  type: DataType;
};

export function ItemEditor<T>({
  name,
  items,
  setItems,
  children,
  type,
}: ItemEditorProps<T>): ReactElement {
  const id = useId();
  const editorStyle = useStyles();
  const setSelected = useSetAtom(selectedItemKeyFamily(type));
  const setToast = useToast();

  const typeName = DataTypeNames[type];
  const close = () => setSelected(undefined);

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
    <div className={editorStyle.stack}>
      <Toolbar className={editorStyle.toolbar}>
        <Text weight="bold">{typeName} Editor</Text>
        <ToolbarButton
          appearance="subtle"
          aria-label="Close"
          icon={<DismissRegular />}
          onClick={close}
        />
      </Toolbar>
      <Toolbar className={editorStyle.toolbar}>
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
      <div className={editorStyle.editor}>{children}</div>
    </div>
  );
}
