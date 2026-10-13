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
import { InterpolationType } from 'src/CodeTypes';

import {
  chkRef,
  getInterpType,
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
} from '../../DataTypeChecks';
import { InterpRef, Pose, PoseRef, Ref } from '../../DataTypes';
import { SimpleHeadingRef } from '../ItemEditor/HeadingRef';
import { InterpRefControl } from '../ItemEditor/InterpRef';
import { SimpleValRef } from '../ItemEditor/ValRef';
import {
  DataType,
  selectedKeyAtom,
  symbolTableInterpolationsAtom,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';
import { useListSelection } from './Selection';
import { HeadingSorter, InterpSorter, ValueSorter } from './Sort';

type ListItem = [string, InterpRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'Type',
    compare: (a, b) => InterpSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Type/Ref</Text>,
    renderCell: (li) => (
      <code>{chkRef(li[1]) ? li[1].ref : getInterpType(li[1])}</code>
    ),
  }),
];

export function InterpolatorsList(): ReactElement {
  const interpolationsPair = useAtom(symbolTableInterpolationsAtom);
  const [interpolations] = interpolationsPair;
  const selectionPair = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');

  const [selectedRows, onSelChanged, clearSelection, handleAdd] =
    useListSelection(
      interpolationsPair,
      selectionPair,
      DataType.Interpolations,
      {
        reversed: false,
      },
    );

  const keys = new Set(
    interpolations
      .keys()
      .filter((k) => k.toLowerCase().includes(search.toLowerCase())),
  );

  const items: ListItem[] = [
    ...interpolations.entries().filter(([str]) => keys.has(str)),
  ];

  return (
    <>
      <Toolbar>
        <Text>Interpolators ({interpolations.size})</Text>
        <ToolbarButton icon={<AddRegular />} onClick={handleAdd}>
          Create Interpolator
        </ToolbarButton>
      </Toolbar>

      <Input
        contentBefore={<SearchRegular />}
        type="text"
        placeholder="Search Interpolators"
        value={search}
        onChange={(_, d) => setSearch(d.value)}
      />

      <div>
        {keys.size === 0 ? (
          <div>No interpolators found.</div>
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
      </div>
    </>
  );
}
