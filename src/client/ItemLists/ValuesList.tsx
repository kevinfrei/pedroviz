// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
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

import { ValRef } from '../../DataTypes';
import { SimpleValRef } from '../ItemEditor/ValRef';
import {
  DataType,
  selectedKeyAtom,
  symbolTableValuesAtom,
} from '../state/SymbolTable';
import { useListSelection } from './Selection';
import { ValueSorter } from './Sort';

type ListItem = [string, ValRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'value',
    compare: (a, b) => ValueSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Value/Reference</Text>,
    renderCell: (nv) => <SimpleValRef valref={nv[1]} />,
  }),
];

export function ValuesList(): ReactElement {
  const valuesPair = useAtom(symbolTableValuesAtom);
  const [values] = valuesPair;
  const selectionPair = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');

  const [selectedRows, onSelChanged, clearSelection, handleAdd] =
    useListSelection(valuesPair, selectionPair, DataType.Values, { val: 0 });

  const keys = new Set(
    values.keys().filter((k) => k.toLowerCase().includes(search.toLowerCase())),
  );
  const items: ListItem[] = [...values.entries()].filter(([str]) =>
    keys.has(str),
  );

  return (
    <>
      <Toolbar>
        <Text>Values ({values.size})</Text>
        <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
          Create Value
        </ToolbarButton>
      </Toolbar>
      <Input
        type="text"
        contentBefore={<SearchRegular />}
        value={search}
        placeholder="Search Values"
        onChange={(_, d) => setSearch(d.value)}
      />
      {keys.size === 0 ? (
        <Text>No values found.</Text>
      ) : (
        <DataGrid
          items={items}
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
