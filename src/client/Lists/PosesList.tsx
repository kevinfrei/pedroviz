// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { chkRef, Pose, PoseRef, Ref } from '../../dataTypes';
import { SimpleHeadingRef } from '../Editors/HeadingRefEditor';
import { SimpleValRef } from '../Editors/ValRefEditor';
import { DataType, symbolTablePosesAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import {
  HeadingSorter,
  PoseHeadingSorter,
  PoseXSorter,
  PoseYSorter,
} from './Sort';

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
    compare: (a, b) => PoseXSorter(a[1], b[1]),
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
    compare: (a, b) => PoseYSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Y</Text>,
    renderCell: (np) =>
      chkRef(np[1]) ? <span></span> : <SimpleValRef valref={np[1].Y} />,
  }),
  createTableColumn<ListItem>({
    columnId: 'heading',
    compare: (a, b) => PoseHeadingSorter(a[1], b[1]),
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
