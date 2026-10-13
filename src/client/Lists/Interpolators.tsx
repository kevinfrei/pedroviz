// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { chkRef, getInterpType } from '../../DataTypeChecks';
import { InterpRef } from '../../DataTypes';
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
    columnId: 'Type',
    compare: (a, b) => InterpSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Type/Ref</Text>,
    renderCell: (li) =>
      chkRef(li[1]) ? (
        <Text>
          Interpolation: <code>{li[1].ref}</code>
        </Text>
      ) : (
        <code>{getInterpType(li[1])}</code>
      ),
  }),
];

export function InterpolatorsList(): ReactElement {
  const interpolationsState = useAtom(symbolTableInterpolationsAtom);
  return (
    <SearchableTable
      name="Interpolator"
      dataType={DataType.Interpolations}
      columns={columns}
      itemsState={interpolationsState}
      newItem={{ reversed: false }}
    />
  );
}
