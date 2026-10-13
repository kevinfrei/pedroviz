// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { InterpRef } from '../../DataTypes';
import { SimpleInterpRef } from '../Editors/InterpRef';
import { DataType, symbolTableInterpolationsAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import { InterpSorter } from './Sort';

type ListItem = [string, InterpRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'Type / Reference',
    compare: (a, b) => InterpSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Type/Ref</Text>,
    renderCell: (li) => <SimpleInterpRef interpref={li[1]} />,
  }),
];

export function InterpolatorsList(): ReactElement {
  const interpolationsState = useAtom(symbolTableInterpolationsAtom);
  return (
    <SearchableTable
      dataType={DataType.Interpolations}
      columns={columns}
      itemsState={interpolationsState}
      newItem={{ reversed: false }}
    />
  );
}
