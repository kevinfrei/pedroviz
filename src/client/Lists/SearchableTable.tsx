import { ReactElement, useState } from 'react';

import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  TableColumnDefinition,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';

import { DataType } from '../state/SymbolTable';
import { useListSelection } from './Selection';

type SearchableTableProps<T> = {
  name: string;
  dataType: DataType;
  columns: TableColumnDefinition<[string, T]>[];
  plural?: string;
  itemsState: [Map<string, T>, (map: Map<string, T>) => void];
  newItem: T;
};

export function SearchableTable<T>({
  name,
  plural,
  itemsState,
  dataType,
  newItem,
  columns,
}: SearchableTableProps<T>): ReactElement {
  type ListItem = [string, T];
  const names = plural || name + 's';
  const [search, setSearch] = useState('');
  const [items] = itemsState;
  const [selectedRows, onSelChanged, clearSelection, handleAdd] =
    useListSelection(itemsState, dataType, newItem);

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
          placeholder={`Search ${names}`}
          onChange={(_, d) => setSearch(d.value)}
        />
        <Text>
          ({keys.size} {names} )
        </Text>
        <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
          Create {name}
        </ToolbarButton>
      </Toolbar>
      {keys.size === 0 ? (
        <Text>No {names} found.</Text>
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
