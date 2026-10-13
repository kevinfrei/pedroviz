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
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { chkRef } from '../../DataTypeChecks';
import { Pose, PoseRef, Ref } from '../../DataTypes';
import { SimpleHeadingRef } from '../Editors/HeadingRef';
import { SimpleValRef } from '../Editors/ValRef';
import {
  DataType,
  selectedKeyAtom,
  symbolTablePosesAtom,
} from '../state/SymbolTable';
import { ListToolbar } from './ListToolbar';
import { SearchableTable } from './SearchableTable';
import { useListSelection } from './Selection';
import { HeadingSorter, PoseSorter } from './Sort';

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
  const posesState = useAtom(symbolTablePosesAtom);
  return (
    <SearchableTable
      name="Pose"
      dataType={DataType.Poses}
      columns={columns}
      itemsState={posesState}
      newItem={{
        X: { val: 65 },
        Y: { val: 77 },
        heading: { angle: { val: 45 }, inRadians: false },
      }}
    />
  );
}
