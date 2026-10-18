// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../DataTypeChecks';
import { ValRefEditor } from '../Editors/ValRefEditor';
import { ValuesList } from '../Lists/ValuesList';
import {
  DataType,
  selectedItemKeyFamily,
  symbolTableValuesAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';

export function ValuesView(): ReactElement {
  const [values, setValues] = useAtom(symbolTableValuesAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Values));
  const activeValue = isUndefined(activeKey)
    ? undefined
    : values.get(activeKey);

  return (
    <>
      <ValuesList />
      <ItemEditor
        open={!!activeValue}
        type={DataType.Values}
        name={activeKey || ''}
        items={values}
        setItems={setValues}>
        <ValRefEditor
          label="Value or Reference"
          item={activeValue!}
          name={activeKey}
          onChange={(newVal) =>
            setValues(NewMapAdd(values, activeKey!, newVal))
          }
        />
      </ItemEditor>
    </>
  );
}
