import { ReactElement, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  Input,
  TableColumnDefinition,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { isUndefined } from '@freik/typechk';

import {
  mkNewCurve,
  mkNewPath,
  mkNewPose,
  mkNewVal,
  mkTangentInterp,
} from '../../dataTypes';
import { NewMapAdd } from '../../helpers';
import { searchAtom } from '../state/BasicState';
import {
  activeTabAtom,
  DataType,
  DataTypeItemsFamily,
  DataTypeNames,
  selectedItemKeyFamily,
} from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';

function getSelection(sel: string | undefined): Set<string> {
  return isUndefined(sel) ? new Set() : new Set([sel]);
}

type Maker<T> = () => T;

function getItemCreator<T>(dataType: DataType): Maker<T> {
  switch (dataType) {
    case DataType.Values:
      return mkNewVal as Maker<T>;
    case DataType.Poses:
      return mkNewPose as Maker<T>;
    case DataType.Interpolations:
      return mkTangentInterp as Maker<T>;
    case DataType.Curves:
      return mkNewCurve as Maker<T>;
    case DataType.Paths:
      return mkNewPath as Maker<T>;
  }
  return mkNewVal as Maker<T>;
}

export function SearchToolbar(): ReactElement {
  const activeTab = useAtomValue(activeTabAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const setSelected = useSetAtom(selectedItemKeyFamily(activeTab));
  const setToast = useToast();

  const name = DataTypeNames[activeTab];
  const plural = name + 's';
  const [items, setItems] = useAtom(DataTypeItemsFamily(activeTab));

  const newItem = () => {
    const foo = getItemCreator(activeTab)();
    console.log(foo);
    return foo;
  };
  const handleAdd = () => {
    let count = 1;
    if (isUndefined(name)) {
      return;
    }
    while (items.has(`new${name}${count}`)) count++;
    const newKey = `new${name}${count}`;

    setItems(
      NewMapAdd(items, newKey, newItem()) as unknown as Parameters<
        typeof setItems
      >[0],
    );
    setSelected(newKey);
    console.log('added', newKey);
    setToast(`Added ${name.toLocaleLowerCase()} "${newKey}"`);
  };

  return (
    <Toolbar>
      <Input
        type="text"
        contentBefore={<SearchRegular />}
        value={search}
        placeholder={`Search ${plural}`}
        onChange={(_, d) => setSearch(d.value)}
      />
      &nbsp;
      <ToolbarButton
        onClick={handleAdd}
        icon={<AddRegular />}
        appearance="primary">
        New {name}
      </ToolbarButton>
    </Toolbar>
  );
}

type SearchableTableProps<T> = {
  dataType: DataType;
  columns: TableColumnDefinition<[string, T]>[];
  itemsState: [Map<string, T>, (map: Map<string, T>) => void];
};

export function SearchableTable<T>({
  itemsState,
  dataType,
  columns,
}: SearchableTableProps<T>): ReactElement {
  type ListItem = [string, T];
  const search = useAtomValue(searchAtom);
  const [items] = itemsState;
  const [selected, setSelected] = useAtom(selectedItemKeyFamily(dataType));

  const name = DataTypeNames[dataType];
  const plural = name + 's';
  const selectedRows = getSelection(selected);

  const onSelChanged: DataGridProps['onSelectionChange'] = useCallback(
    (_, data) => {
      if (data.selectedItems.size === 0) {
        setSelected(undefined);
      } else {
        const item = [...data.selectedItems].pop();
        if (isUndefined(item)) {
          return;
        }
        const ref = items.get(item as string);
        if (isUndefined(ref)) {
          return;
        }
        setSelected(item as string);
      }
    },
    [setSelected, selected, items, dataType],
  );

  // This enables deselection
  const toggleSelection = (id: string) => {
    setSelected(selected === id ? undefined : id);
  };

  const keys = new Set(
    items.keys().filter((k) => k.toLowerCase().includes(search.toLowerCase())),
  );
  const filteredItems: ListItem[] = [...items.entries()].filter(([str]) =>
    keys.has(str),
  );

  return keys.size === 0 ? (
    <Text>No {plural} found.</Text>
  ) : (
    <DataGrid
      items={filteredItems}
      columns={columns}
      sortable
      resizableColumns
      getRowId={(itm: ListItem) => itm[0]}
      selectionMode="single"
      selectedItems={selectedRows}
      onSelectionChange={onSelChanged}
      style={{ overflowY: 'auto' }}>
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
            onClick={() => toggleSelection(item[0])}>
            {({ renderCell, columnId }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
}
