// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { Path } from '../../DataTypes';
import { SimpleInterpRef } from '../Editors/InterpRef';
import { DataType, symbolTablePathsAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import { CurveArraySorter, MaybeInterpSorter } from './Sort';

type ListItem = [string, Path];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">Name</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'curves',
    compare: (a, b) => CurveArraySorter(a[1].curves, b[1].curves),
    renderHeaderCell: () => <Text weight="bold">Curve Count</Text>,
    renderCell: (li) => <code>{li[1].curves.length} Curves/Lines</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'globInterp',
    compare: (a, b) =>
      MaybeInterpSorter(a[1].globalInterpolator, b[1].globalInterpolator),
    renderHeaderCell: () => <Text weight="bold">Whole Path Interpolator</Text>,
    renderCell: (li) => (
      <SimpleInterpRef interpref={li[1].globalInterpolator} />
    ),
  }),
];

export function PathsList(): ReactElement {
  const pathsState = useAtom(symbolTablePathsAtom);
  return (
    <SearchableTable
      dataType={DataType.Paths}
      columns={columns}
      itemsState={pathsState}
      newItem={{
        curves: [
          {
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
          },
        ],
      }}
    />
  );
}
