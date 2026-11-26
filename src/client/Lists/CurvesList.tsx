// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { chkRef, CurveRef } from '../../dataTypes';
import { Strings } from '../Constants';
import { SimpleInterpRef } from '../Editors/InterpRefEditor';
import { DataType, symbolTableCurvesAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import { CurveSorter } from './Sort';

type ListItem = [string, CurveRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">{Strings.Name}</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'Type',
    compare: (a, b) => CurveSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">{Strings.Type_Ref}</Text>,
    renderCell: (li) =>
      chkRef(li[1]) ? (
        <Text>
          <code>"{li[1].ref}"</code>
        </Text>
      ) : (
        <Text>
          {li[1].points.length}
          {Strings.PointSuffix}
          <SimpleInterpRef interpref={li[1].interpolation} />
        </Text>
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
    />
  );
}
