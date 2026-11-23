// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../helpers';
import { ItemEditor } from '../Editors/ItemEditorWrapper';
import { ValRefEditor } from '../Editors/ValRefEditor';
import {
  activeTabAtom,
  DataType,
  selectedItemKeyFamily,
  symbolTableValuesAtom,
} from '../state/SymbolTable';

export function ValueEditor(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Values));
  const activeTab = useAtomValue(activeTabAtom);
  const activeValue = isUndefined(activeKey)
    ? undefined
    : values.get(activeKey);

  return (
    <ItemEditor
      open={!!activeValue && activeTab === DataType.Values}
      type={DataType.Values}
      name={activeKey || ''}
      items={values}
      setItems={setValues}>
      <ValRefEditor
        topLevel
        label="Value or Reference"
        item={activeValue!}
        name={activeKey}
        onChange={(newVal) => setValues(NewMapAdd(values, activeKey!, newVal))}
      />
    </ItemEditor>
  );
}
