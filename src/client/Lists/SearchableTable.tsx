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
  TableColumnDefinition,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { isDefined, isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete } from '../../DataTypeChecks';
import {
  DataType,
  DataTypeNames,
  SelectedKey,
  selectedKeyAtom,
} from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';

function getSelection(sel: SelectedKey, type: DataType): Set<string> {
  const key = sel.get(type);
  if (isUndefined(key)) {
    return new Set();
  }
  return new Set([key]);
}

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

  const [selected, setSelected] = useAtom(selectedKeyAtom);

  const selectedRows = getSelection(selected, dataType);
  const setToast = useToast();
  const onSelChanged: DataGridProps['onSelectionChange'] = useCallback(
    (_, data) => {
      if (data.selectedItems.size === 0) {
        const newMap = NewMapDelete(selected, dataType);
        if (newMap) {
          setSelected(newMap);
        }
      } else {
        const item = [...data.selectedItems].pop();
        if (isUndefined(item)) {
          return;
        }
        const ref = items.get(item as string);
        if (isUndefined(ref)) {
          return;
        }
        setSelected(NewMapAdd(selected, dataType, item as string));
      }
    },
    [setSelected, selected, items, dataType],
  );

  // This enables deselection
  const clearSelection = (id: string) => {
    if (selected.get(dataType) === id) {
      const newMap = NewMapDelete(selected, dataType);
      if (isDefined(newMap)) {
        setSelected(newMap);
      }
    } else {
      setSelected(NewMapAdd(selected, dataType, id));
    }
  };

  const handleAdd = () => {
    let count = 1;
    if (isUndefined(name)) {
      return;
    }
    while (items.has(`new${name}${count}`)) count++;
    const newKey = `new${name}${count}`;

    setItems(NewMapAdd(items, newKey, newItem));
    setSelected(NewMapAdd(selected, dataType, newKey));
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
        <Input
          type="text"
          contentBefore={<SearchRegular />}
          value={search}
          placeholder={`Search ${plural}`}
          onChange={(_, d) => setSearch(d.value)}
        />
        <Text>
          ({keys.size} {plural} )
        </Text>
        <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
          Create {name}
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
