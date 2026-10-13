// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { ValRef } from '../../DataTypes';
import { SimpleValRef } from '../Editors/ValRef';
import { DataType, symbolTableValuesAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
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
  const valuesState = useAtom(symbolTableValuesAtom);

  return (
    <SearchableTable
      name="Value"
      dataType={DataType.Values}
      columns={columns}
      itemsState={valuesState}
      newItem={{ val: 0 }}
    />
  );
  /*    <>
      <ListToolbar
        count={values.size}
        add={handleAdd}
        name="Value"
        searchState={searchState}
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
  );*/
}
