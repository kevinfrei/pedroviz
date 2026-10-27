import { ReactElement, useCallback, useState } from 'react';
import { useAtom } from 'jotai';

import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  Input,
  makeStyles,
  TableColumnDefinition,
  Text,
  tokens,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { isDefined, isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete } from '../../helpers';
import {
  DataType,
  DataTypeNames,
  selectedItemKeyFamily,
} from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';

function getSelection(sel: string | undefined): Set<string> {
  return isUndefined(sel) ? new Set() : new Set([sel]);
}

const useStyles = makeStyles({
  // The panel container acts as a vertical flexbox
  panelContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden', // Prevents outer panel scrollbars
  },
  // Content area starts at the top and handles scrolling when it overflows
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '0px',
    minHeight: 0, // This makes flex child scrolling work
  },
  // Toolbar stays pinned across the bottom of the panel
  bottomToolbar: {
    flex: '0 0 auto',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '4px 4px',
    display: 'flex',
    justifyContent: 'space-between', // Aligns buttons to the right (or 'space-between', etc.)
    gap: '8px',
  },
});

type SearchableTableProps<T> = {
  dataType: DataType;
  columns: TableColumnDefinition<[string, T]>[];
  itemsState: [Map<string, T>, (map: Map<string, T>) => void];
  newItem: T;
};

export function SearchableTable<T>({
  itemsState,
  dataType,
  newItem,
  columns,
}: SearchableTableProps<T>): ReactElement {
  type ListItem = [string, T];
  const name = DataTypeNames[dataType];
  const plural = name + 's';
  const [search, setSearch] = useState('');
  const [items, setItems] = itemsState;

  const [selected, setSelected] = useAtom(selectedItemKeyFamily(dataType));

  const selectedRows = getSelection(selected);
  const setToast = useToast();
  const onSelChanged: DataGridProps['onSelectionChange'] = useCallback(
    (_, data) => {
      if (data.selectedItems.size === 0) {
        setSelected(undefined);
      } else {
        const item = [...data.selectedItems].pop();
        if (isUndefined(item)) {
          return;
        }
        const ref = items.get(item as string);
        if (isUndefined(ref)) {
          return;
        }
        setSelected(item as string);
      }
    },
    [setSelected, selected, items, dataType],
  );

  // This enables deselection
  const clearSelection = (id: string) => {
    setSelected(selected === id ? undefined : id);
  };

  const handleAdd = () => {
    let count = 1;
    if (isUndefined(name)) {
      return;
    }
    while (items.has(`new${name}${count}`)) count++;
    const newKey = `new${name}${count}`;

    setItems(NewMapAdd(items, newKey, newItem));
    setSelected(newKey);
    setToast(`Added ${name.toLocaleLowerCase()} "${newKey}"`);
  };

  const keys = new Set(
    items.keys().filter((k) => k.toLowerCase().includes(search.toLowerCase())),
  );
  const filteredItems: ListItem[] = [...items.entries()].filter(([str]) =>
    keys.has(str),
  );

  return (
    <>
      <Toolbar>
        &nbsp;
        <Input
          type="text"
          contentBefore={<SearchRegular />}
          value={search}
          placeholder={`Search ${plural}`}
          onChange={(_, d) => setSearch(d.value)}
        />
        <Text>
          &nbsp;({keys.size} {plural})&nbsp;
        </Text>
        <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
          Create Named {name}
        </ToolbarButton>
      </Toolbar>
      {keys.size === 0 ? (
        <Text>No {plural} found.</Text>
      ) : (
        <DataGrid
          items={filteredItems}
          columns={columns}
          sortable
          resizableColumns
          getRowId={(itm: ListItem) => itm[0]}
          selectionMode="single"
          selectedItems={selectedRows}
          onSelectionChange={onSelChanged}>
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<ListItem>>
            {({ item, rowId }) => (
              <DataGridRow<ListItem>
                key={rowId}
                onClick={() => clearSelection(item[0])}>
                {({ renderCell, columnId }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      )}
    </>
  );
}
