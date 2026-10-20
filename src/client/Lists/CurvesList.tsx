// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { chkRef, CurveRef, getInterpType } from '../../dataTypes';
import { DataType, symbolTableCurvesAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import { CurveSorter } from './Sort';

type ListItem = [string, CurveRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'Type',
    compare: (a, b) => CurveSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">Type/Ref</Text>,
    renderCell: (li) =>
      chkRef(li[1]) ? (
        <Text>
          Curve: <code>{li[1].ref}</code>
        </Text>
      ) : (
        <code>
          {li[1].points.length} points, {getInterpType(li[1].interpolation)}
        </code>
      ),
  }),
];

export function CurvesList(): ReactElement {
  const curvesState = useAtom(symbolTableCurvesAtom);
  return (
    <SearchableTable
      dataType={DataType.Curves}
      columns={columns}
      itemsState={curvesState}
      newItem={{
        points: [
          {
            X: { val: 10 },
            Y: { val: 10 },
          },
          {
            X: { val: 50 },
            Y: { val: 10 },
          },
        ],
        interpolation: { reversed: false },
      }}
    />
  );
}
