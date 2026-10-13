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

import { chkRef } from '../../DataTypeChecks';
import { Pose, PoseRef, Ref } from '../../DataTypes';
import { SimpleHeadingRef } from '../ItemEditor/HeadingRef';
import { SimpleValRef } from '../ItemEditor/ValRef';
import {
  DataType,
  selectedKeyAtom,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { useListSelection } from './Selection';
import { HeadingSorter, PoseSorter, ValueSorter } from './Sort';

type ListItem = [string, PoseRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'X/Ref',
    compare: (a, b) => PoseSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">X/Ref</Text>,
    renderCell: (np) =>
      chkRef(np[1]) ? (
        <span>
          {/* TODO: Maybe include the resolved value? */}
          <code>Pose: {np[1].ref}</code>
        </span>
      ) : (
        <SimpleValRef valref={np[1].X} />
      ),
  }),
  createTableColumn<ListItem>({
    columnId: 'Y',
    compare: (a, b) => PoseSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Y</Text>,
    renderCell: (np) =>
      chkRef(np[1]) ? <span></span> : <SimpleValRef valref={np[1].Y} />,
  }),
  createTableColumn<ListItem>({
    columnId: 'heading',
    compare: (a, b) => {
      const ap = a[1];
      const bp = b[1];
      const aRef = chkRef(ap);
      const bRef = chkRef(bp);
      if (aRef !== bRef) {
        return aRef ? -1 : 1;
      }
      if (aRef) {
        return ap.ref.localeCompare((bp as Ref).ref);
      }
      return HeadingSorter(ap?.heading, (bp as Pose | undefined)?.heading);
    },
    renderHeaderCell: () => <Text weight="bold">Heading</Text>,
    renderCell: (np) =>
      chkRef(np[1]) || !np[1].heading ? (
        <span></span>
      ) : (
        <SimpleHeadingRef headingref={np[1].heading} />
      ),
  }),
];

export function PosesList(): ReactElement {
  const posesPair = useAtom(symbolTablePosesAtom);
  const [poses] = posesPair;
  const selectionPair = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');

  const [selectedRows, onSelChanged, clearSelection, handleAdd] =
    useListSelection(posesPair, selectionPair, DataType.Poses, {
      X: { val: 0 },
      Y: { val: 0 },
      heading: { angle: { val: 0 }, inRadians: true },
    });

  const keys = new Set(
    poses.keys().filter((k) => k.toLowerCase().includes(search.toLowerCase())),
  );
  const items: ListItem[] = [...poses.entries()].filter(([str]) =>
    keys.has(str),
  );

  return (
    <>
      <Toolbar>
        <Text>Poses ({poses.size})</Text>
        <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
          Create Pos
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
