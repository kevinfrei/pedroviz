// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { isUndefined } from '@freik/typechk';

import { InterpRef } from '../../dataTypes';
import { NewMapAdd } from '../../helpers';
import { InterpRefEditor } from '../Editors/InterpRefEditor';
import { InterpolatorsList } from '../Lists/InterpolatorsList';
import {
  activeTabAtom,
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
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <>
      <InterpolatorsList />
      <ItemEditor
        open={!!activeInterp && activeTab === DataType.Interpolations}
        name={activeKey || ''}
        type={DataType.Interpolations}
        items={interpolations}
        setItems={setInterpolations}>
        <InterpRefEditor
          topLevel
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
