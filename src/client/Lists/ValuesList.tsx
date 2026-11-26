// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  createTableColumn,
  TableColumnDefinition,
  Text,
} from '@fluentui/react-components';

import { ValRef } from '../../dataTypes';
import { Strings } from '../Constants';
import { SimpleValRef } from '../Editors/Viewers';
import { DataType, symbolTableValuesAtom } from '../state/SymbolTable';
import { SearchableTable } from './SearchableTable';
import { ValueSorter } from './Sort';

type ListItem = [string, ValRef];

const columns: TableColumnDefinition<ListItem>[] = [
  createTableColumn<ListItem>({
    columnId: 'name',
    compare: (a, b) => a[0].localeCompare(b[0]),
    renderHeaderCell: () => <Text weight="bold">{Strings.Name}</Text>,
    renderCell: (li) => <code>{li[0]}</code>,
  }),
  createTableColumn<ListItem>({
    columnId: 'value',
    compare: (a, b) => ValueSorter(a[1], b[1]),
    renderHeaderCell: () => <Text weight="bold">{Strings.Val_Ref}</Text>,
    renderCell: (nv) => <SimpleValRef valref={nv[1]} />,
  }),
];

export function ValuesList(): ReactElement {
  const valuesState = useAtom(symbolTableValuesAtom);
  return (
    <SearchableTable
      dataType={DataType.Values}
      columns={columns}
      itemsState={valuesState}
    />
  );
}
