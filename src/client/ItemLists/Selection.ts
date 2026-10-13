import { useCallback } from 'react';
import { SetStateAction, useAtom } from 'jotai';

import { DataGridProps } from '@fluentui/react-components';
import { isDefined, isUndefined } from '@freik/typechk';

import { NewMapAdd, NewMapDelete } from '../../DataTypeChecks';
import { DataType, DataTypeNames, SelectedKey } from '../state/SymbolTable';
import { useToast } from '../ui-tools/NotificationToast';

export function getSelection(sel: SelectedKey, type: DataType): Set<string> {
  const key = sel.get(type);
  if (isUndefined(key)) {
    return new Set();
  }
  return new Set([key]);
}

export type ListSelectionHelper = [
  Set<string>, // The selected set
  DataGridProps['onSelectionChange'], // the selection chained callback
  (id: string) => void, // maybe clear the selection helper
  () => void, // add item
];

export function useListSelection<T>(
  [items, setItems]: ReturnType<
    typeof useAtom<Map<string, T>, [SetStateAction<Map<string, T>>], void>
  >,
  [selected, setSelected]: ReturnType<
    typeof useAtom<SelectedKey, [SetStateAction<SelectedKey>], void>
  >,
  type: DataType,
  newItem: T,
): ListSelectionHelper {
  const setToast = useToast();
  const selectedRows = getSelection(selected, type);
  const onSelectionChange: DataGridProps['onSelectionChange'] = useCallback(
    (_, data) => {
      if (data.selectedItems.size === 0) {
        const newMap = NewMapDelete(selected, type);
        if (newMap) {
          setSelected(newMap);
        }
      } else {
        const item = [...data.selectedItems].pop();
        if (isUndefined(item)) {
          return;
        }
        const ref = items.get(item as string);
        if (isUndefined(ref)) {
          return;
        }
        setSelected(NewMapAdd(selected, type, item as string));
      }
    },
    [setSelected, selected, items, type],
  );

  // This enables deselection
  const maybeClearSelection = (id: string) => {
    if (selected.get(type) === id) {
      const newMap = NewMapDelete(selected, type);
      if (isDefined(newMap)) {
        setSelected(newMap);
      }
    } else {
      setSelected(NewMapAdd(selected, type, id));
    }
  };

  const handleAdd = () => {
    let count = 1;
    const name = DataTypeNames[type];
    if (isUndefined(name)) {
      return;
    }
    while (items.has(`new${name}${count}`)) count++;
    const newKey = `new${name}${count}`;

    setItems(NewMapAdd(items, newKey, newItem));
    setSelected(NewMapAdd(selected, type, newKey));
    setToast(`Added ${name.toLocaleLowerCase()} "${newKey}"`);
  };

  return [selectedRows, onSelectionChange, maybeClearSelection, handleAdd];
}
