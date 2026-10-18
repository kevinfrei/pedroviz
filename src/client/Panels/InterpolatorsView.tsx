// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { NewMapAdd } from '../../DataTypeChecks';
import { InterpRef } from '../../DataTypes';
import { InterpRefEditor } from '../Editors/InterpRefEditor';
import { InterpolatorsList } from '../Lists/InterpolatorsList';
import {
  DataType,
  selectedItemKeyFamily,
  symbolTableInterpolationsAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';

// Interpolators Store Editor
export function InterpolatorsView(): ReactElement {
  const [interpolations, setInterpolations] = useAtom(
    symbolTableInterpolationsAtom,
  );
  const activeKey = useAtomValue(
    selectedItemKeyFamily(DataType.Interpolations),
  );
  const activeInterp = isUndefined(activeKey)
    ? undefined
    : interpolations.get(activeKey);

  return (
    <>
      <InterpolatorsList />
      <ItemEditor
        open={!!activeInterp}
        name={activeKey || ''}
        type={DataType.Interpolations}
        items={interpolations}
        setItems={setInterpolations}>
        <InterpRefEditor
          label="Interpolator Definition"
          item={activeInterp as InterpRef}
          onChange={(updatedInterp: InterpRef) =>
            setInterpolations(
              NewMapAdd(interpolations, activeKey!, updatedInterp),
            )
          }
        />
      </ItemEditor>
    </>
  );
}
